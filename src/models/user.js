import Promise                      from 'bluebird';
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

  postalAddress() {
    return this.hasOne('PostalAddress');
  },

  businessAddress() {
    return this.hasOne('PostalAddress');
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

  sendLoginEmail: async function(i18n) {
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
      type User {
        id: ID!
        firstName: String!
        lastName: String!
        email: String
        phone: String
        profilePicture: String
        phoneNumber: String
      }
    `;
  },

  resolver: {
    Query: {
      currentUser: (_, __, { user }) => {
        if (user) {
          return {
            id: user.id,
            firstName: user.get('firstName'),
            lastName: user.get('lastName'),
            email: user.get('email'),
            // phoneNumber: user.get('phoneNumber'),
            profilePicture: user.get('profilePicture')
          };
        }
        return null;
      },
    },
  }
});

export default bookshelf.model('User', User);
