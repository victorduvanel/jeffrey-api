import Promise                      from 'bluebird';
import moment                       from 'moment';
import request                      from 'request-promise';
import nativeBcrypt                 from 'bcryptjs';
import bookshelf                    from '../services/bookshelf';
import uuid                         from 'uuid';
import Base                         from './base';
import AccessToken                  from './access-token';
import googleService                from '../services/google';
import * as mjml                    from '../services/mjml';
import { sendEmail }                from '../services/mailgun';
import LoginToken                   from './login-token';
import config                       from '../config';
import UserDocument                 from './user-document';
import PostalAddress                from './postal-address';

import './postal-address';
import './business';

export const InvalidCredentials = new Error('Invalid Credentials');
export const DuplicatedUser = new Error('Duplicated User');
export const PasswordComplexity = new Error('PasswordComplexity');

const bcrypt = Promise.promisifyAll(nativeBcrypt);

const User = Base.extend({
  tableName: 'users',

  devices() {
    return this.hasMany('UserDevice', 'owner_id');
  },

  conversations() {
    return this.hasMany('Conversation');
  },

  stripeCard() {
    return this.hasMany('StripeCard');
  },

  createAccessToken({ singleUse = false }) {
    return AccessToken.create({ user: this, singleUse });
  },

  business() {
    return this.hasOne('Business', 'owner_id');
  },

  postalAddress() {
    return this.belongsTo('PostalAddress');
  },

  businessAddress() {
    return this.hasOne('PostalAddress');
  },

  async getPostalAddress() {
    if (this.get('postalAddressId')) {
      await this.load(['postalAddress']);
      return this.related('postalAddress');
    } else {
      const postalAddress = await PostalAddress.create();
      this.set('postalAddressId', postalAddress.get('id'));
      await this.save();
      return postalAddress;
    }
  },

  async setDetails(params) {
    const details = [
      'firstName',
      'lastName',
      'dateOfBirth',
      'gender'
    ];

    let detail, value;
    for (detail of details) {
      if (params.hasOwnProperty(detail)) {
        value = params[detail];
        if (value === null) {
          this.set(detail, null);
        } else if (typeof value === 'string') {
          value = value.trim();
          if (value.length) {
            this.set(detail, value);
          } else {
            this.set(detail, null);
          }
        }
      }
    }

    if (this.hasChanged()) {
      await this.save();
    }
  },

  async hasIdentityDocument() {
    const documents = await UserDocument.findIdentifyDocuments(this);
    return documents && documents.length > 0;
  },

  async updatePassword(newPassword) {
    const saltRounds = 10;

    const checks = [/.{6,200}/, /[A-Z]/, /[a-z]/, /\d/];
    const ok = !checks.find(test => !test.test(newPassword));

    if (!ok) {
      throw PasswordComplexity;
    }

    const hash = await bcrypt.hashAsync(newPassword, saltRounds);
    this.set('password', hash);
    await this.save();
  },

  async paymentMethodStatus() {
    await this.load('stripeCard');

    const customers = this.related('stripeCard');
    if (!customers.length) {
      return 'not_set';
    }

    const customer = customers.at(0);
    const expYear = customer.get('expYear');
    const expMonth = customer.get('expMonth');

    const now = new Date();
    const expirationDate = new Date(expYear, expMonth - 1);

    if (now >= expirationDate) {
      return 'expired';
    } else if ((now - expirationDate) / (1000 * 60 * 60 * 24) >= 30) {
      // expires in 30 days or less
      return 'expired_soon';
    } else {
      return 'ok';
    }
  },

  async onboardingProgress() {
    const progress = [];

    if (this.get('profilePicture')) {
      progress.push('profile-picture');
    }

    if (
      this.get('gender') &&
      this.get('firstName') &&
      this.get('lastName') &&
      this.get('dateOfBirth')
    ) {
      progress.push('personal-details');
    }

    if (this.get('phoneNumber')) {
      progress.push('phone-number');
    }

    await this.load(['postalAddress', 'business']);

    const business = this.related('business');
    if (business && await business.isOk()) {
      progress.push('business');
    }

    const postalAddress = this.related('postallAddress');
    if (postalAddress && await postalAddress.isOk()) {
      progress.push('postal-address');
    }

    if (this.get('tosAcceptedAt')) {
      progress.push('tos');
    }

    if (await this.hasIdentityDocument()) {
      progress.push('identity-document');
    }

    return progress;
  },

  sendMessage(notification) {
    return this.pushNotification(notification);
  },

  async pushNotification(notification) {
    await this.load(['devices']);

    const devices = this.related('devices');

    return Promise.all(devices.map((device) => {
      return device.pushNotification(notification);
    }));
  },

  async sendLoginEmail(i18n) {
    const emailAddress = this.get('email');
    const loginToken = await LoginToken.create({ user: this });

    const message = await mjml.render('email/login', i18n, {
      user: this.serialize(),
      loginLink: `${config.webappProtocol}://${config.webappHost}/app-link/login/${loginToken.get('id')}`,
    });

    return sendEmail({
      from: i18n('email_from'),
      to: emailAddress,
      subject: i18n('email_login_subject'),
      message
    });
  },

  toJSON() {
    let attrs = Base.prototype.toJSON.apply(this, arguments);
    delete attrs.password;
    return attrs;
  }
}, {
  authenticate: async function({ email, password }) {
    const user = await this.forge({ email }).fetch();

    if (user && user.get('password') !== null) {
      const passwordMatch = await bcrypt.compareAsync(password, user.get('password'));

      if (passwordMatch) {
        return user;
      }
    }

    throw InvalidCredentials;
  },

  facebookAuthenticate: async function(token) {
    const response = await request({
      method: 'GET',
      uri: 'https://graph.facebook.com/v2.12/me?fields=id,first_name,last_name,email,verified',
      auth: {
        bearer: token
      },
      form: {
        id_token: token
      }
    });

    const facebookUser = JSON.parse(response);

    if (!facebookUser.verified) {
      throw new Error('user not verified');
    }

    const user = await this.forge({
      facebookId: facebookUser.id
    }).fetch();

    if (user) {
      return user;
    }

    return this.create({
      facebookId: facebookUser.id,
      firstName: facebookUser.first_name,
      lastName: facebookUser.last_name,
      email: facebookUser.email
    });
  },

  googleAuthenticate: async function(token) {
    const googleUser = await googleService.verifyToken(token);
    const user = await this.forge({ googleId: googleUser.id }).fetch();

    if (user) {
      return user;
    }

    if (!googleUser.verified) {
      throw new Error('User not verified');
    }

    return this.create({
      googleId: googleUser.id,
      email: googleUser.email,
      firstName: googleUser.firstName,
      lastName: googleUser.lastName
    });
  },

  find: function(id) {
    return this.forge({ id }).fetch();
  },

  create: async function(props) {
    const id = uuid.v4();

    return this.forge({ id, ...props })
      .save(null, { method: 'insert' })
      .catch((err) => {
        if (err.code === '23505') {
          throw DuplicatedUser;
        }

        throw err;
      });
  },

  graphqlDef: function() {
    return `
      enum Gender {
        male
        female
      }
      input PersonalDetails {
        firstName: String
        lastName: String
        dateOfBirth: String
        gender: Gender
        city: String
        country: String
        line1: String
        line2: String
        postalCode: String
        state: String
      }
      type User {
        id: ID!
        firstName: String
        lastName: String
        dateOfBirth: String
        email: String
        gender: Gender
        phone: String
        profilePicture: String
        phoneNumber: String
        postalAddress: PostalAddress
      }
    `;
  },

  resolver: {
    User: {
      postalAddress: async({ id }) => {
        const user = await User.find(id);
        if (!user || !user.get('postalAddressId')) {
          return null;
        }

        await user.load(['postalAddress']);
        const postalAddress = user.related('postalAddress');
        if (!postalAddress) {
          return null;
        }

        return {
          id: postalAddress.id,
          city: postalAddress.get('city'),
          country: postalAddress.get('country'),
          line1: postalAddress.get('line1'),
          line2: postalAddress.get('line2'),
          postalCode: postalAddress.get('postalCode'),
          state: postalAddress.get('state'),
        };
      }
    },
    Query: {
      currentUser: (_, __, { user }) => {
        if (user) {
          let dateOfBirth = null;
          if (user.get('dateOfBirth')) {
            dateOfBirth = moment(user.get('dateOfBirth')).format('YYYY-MM-DD');
          }
          return {
            id: user.id,
            firstName: user.get('firstName'),
            lastName: user.get('lastName'),
            email: user.get('email'),
            gender: user.get('gender'),
            dateOfBirth,
            phoneNumber: user.get('phoneNumber'),
            profilePicture: user.get('profilePicture')
          };
        }
        return null;
      },
    },

    Mutation: {
      personalDetails: async (_, params, { u }) => {
        const user = await User.find('3c656ce5-1e21-4332-a268-d7599f2f0e40');

        let {
          firstName,
          lastName,
          dateOfBirth,
          gender,
          city,
          country,
          line1,
          line2,
          postalCode,
          state
        } = params;

        await user.setDetails({
          firstName,
          lastName,
          dateOfBirth,
          gender,
        });

        const postalAddress = await user.getPostalAddress();

        await postalAddress.update({
          city,
          country,
          line1,
          line2,
          postalCode,
          state
        });

        return true;
      }
    }
  }
});

export default bookshelf.model('User', User);
