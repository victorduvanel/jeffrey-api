import Promise                      from 'bluebird';
import moment                       from 'moment';
import request                      from 'request-promise';
import nativeBcrypt                 from 'bcryptjs';
import uuid                         from 'uuid';
import buckets                      from '../services/google/storage';
import bookshelf                    from '../services/bookshelf';
import stripe                       from '../services/stripe';
import Base                         from './base';
import AccessToken                  from './access-token';
import googleService                from '../services/google';
import * as mjml                    from '../services/mjml';
import { sendEmail }                from '../services/mailgun';
import LoginToken                   from './login-token';
import config                       from '../config';
import UserDocument                 from './user-document';
import PostalAddress                from './postal-address';
import Business                     from './business';
import TOSAcceptance                from './tos-acceptance';
import StripeAccount                from './stripe-account';
import ServiceCategory              from './service-category';
import ProviderPrice                from './provider-price';

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

  reviews() {
    return this.hasMany('Review', 'provider_id');
  },

  givenReviews() {
    return this.hasMany('Review', 'author_id');
  },

  conversations() {
    return this.hasMany('Conversation');
  },

  stripeCard() {
    return this.hasMany('StripeCard');
  },

  async stripeAccount(create = true) {
    const stripeAccount = await StripeAccount
      .forge({
        userId: this.get('id')
      })
      .fetch();

    if (!stripeAccount && create) {
      return StripeAccount.create(this);
    }
    return stripeAccount;
  },

  async syncStripeAccount() {
    const dateOfBirth = this.get('dateOfBirth');

    await this.load(['business', 'postalAddress']);

    const postalAddress = this.related('postalAddress');
    const business = this.related('business');
    let businessAddress = null;

    if (business) {
      await business.load(['postalAddress']);
      businessAddress = business.related('postalAddress');
    }

    const tosAcceptance = await this.tosAcceptance();

    const idDocument = await UserDocument.findIdentifyDocuments(this);
    const filename = idDocument.get('uri').split('/').splice(4).join('/');

    const region = 'EU';
    const bucket = buckets[region];

    const fileContent = await bucket
      .file(filename)
      .download();

    const stripeAccount = await this.stripeAccount();

    const idProof = await stripe.fileUploads.create({
      purpose: 'identity_document',
      file: {
        data: fileContent[0],
        type: idDocument.get('mime')
      }
    }, {
      stripe_account: stripeAccount.get('id')
    });

    const accountAttributes = {
      business_name: business && business.get('name'),
      legal_entity: {
        first_name: this.get('firstName'),
        last_name: this.get('lastName'),

        dob: (dateOfBirth && {
          day: moment(dateOfBirth).format('DD'),
          month: moment(dateOfBirth).format('MM'),
          year: moment(dateOfBirth).format('YYYY'),
        }),


        personal_address: (postalAddress && {
          city: postalAddress.get('city'),
          country: postalAddress.get('country'),
          line1: postalAddress.get('line1'),
          line2: postalAddress.get('line2'),
          postal_code: postalAddress.get('postalCode'),
          state: postalAddress.get('state')
        }),

        type: business && business.get('type'),
        business_tax_id: business && business.get('taxId'),

        address: businessAddress && {
          city: businessAddress.get('city'),
          country: businessAddress.get('country'),
          line1: businessAddress.get('line1'),
          line2: businessAddress.get('line2'),
          postal_code: businessAddress.get('postalCode'),
          state: businessAddress.get('state')
        },

        verification: {
          document: idProof.id
        }
      },

      tos_acceptance: tosAcceptance && {
        ip: tosAcceptance.get('ip'),
        user_agent: tosAcceptance.get('userAgent'),
        date: parseInt(moment(tosAcceptance.get('createdAt')).format('X'), 10)
      }
    };

    await stripe.accounts.update(stripeAccount.get('id'), accountAttributes);
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

  tosAcceptance() {
    return TOSAcceptance.forge({
      userId: this.get('id')
    })
      .orderBy('created_at', 'DESC')
      .fetch();
  },

  async rank() {
    const res = await bookshelf
      .knex('reviews')
      .avg('rank as rank')
      .where('provider_id', '=', this.get('id'));
    return res[0].rank;
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

  async getBusiness() {
    let business = await Business
      .forge({
        ownerId: this.id
      })
      .fetch();

    if (business) {
      return business;
    }

    const postalAddress = await this.getPostalAddress();

    business = await Business.create({
      owner: this,
      postalAddress
    });

    return business;
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
    const idDocument = await UserDocument.findIdentifyDocuments(this);
    return !!idDocument;
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

  async stripeCustomer() {
    if (this.get('stripeCustomerId')) {
      return this.get('stripeCustomerId');
    }

    const customer = await stripe.customers.create({
      metadata: {
        user_id: this.get('id')
      }
    });

    this.set('stripeCustomerId', customer.id);
    await this.save();
    return customer.id;
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

    if (this.get('profilePicture') /* && this.get('bio') */) {
      progress.push('provider-profile');
    }

    if (
      this.get('gender') &&
      this.get('firstName') &&
      this.get('lastName') &&
      this.get('dateOfBirth')
    ) {
      const postalAddress = await this.getPostalAddress();
      if (postalAddress && await postalAddress.isOk()) {
        progress.push('personal-details');
      }
    }

    if (this.get('phoneNumber')) {
      progress.push('phone-number');
    }

    const business = await this.getBusiness();
    if (business && await business.isOk()) {
      progress.push('business');
    }

    if (await this.tosAcceptance()) {
      progress.push('tos');
    }

    const stripeAccount = await this.stripeAccount(false);
    if (stripeAccount && stripeAccount.get('hasExternalAccount')) {
      progress.push('bank-details');
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

  async sendLoginEmail(i18n, uriPrefix) {
    const emailAddress = this.get('email');
    const loginToken = await LoginToken.create({ user: this });

    const prefix = uriPrefix || `${config.webappProtocol}://${config.webappHost}/`;

    const message = await mjml.render('email/login', i18n, {
      user: this.serialize(),
      loginLink: `${prefix}login/${loginToken.get('id')}`,
    });

    return sendEmail({
      from: i18n('email_from'),
      to: emailAddress,
      subject: i18n('email_login_subject'),
      message
    });
  },

  async serialize() {
    let dateOfBirth = null;
    if (this.get('dateOfBirth')) {
      dateOfBirth = moment(this.get('dateOfBirth')).format('YYYY-MM-DD');
    }

    return {
      id: this.get('id'),
      color: 'turquoise',
      bio: this.get('bio'),
      isProvider: this.get('isProvider'),
      isAvailable: this.get('isAvailable'),
      firstName: this.get('firstName'),
      lastName: this.get('lastName'),
      email: this.get('email'),
      gender: this.get('gender'),
      dateOfBirth,
      phoneNumber: this.get('phoneNumber'),
      profilePicture: this.get('profilePicture'),
      rank: await this.rank()
    };
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

  graphqlDef() {
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
        isProvider: Boolean
        isAvailable: Boolean
        firstName: String
        lastName: String
        dateOfBirth: String
        color: String
        email: String
        gender: Gender
        phone: String
        profilePicture: String
        phoneNumber: String
        postalAddress: PostalAddress
        reviews: [Review]
        rank: Float
        bio: String
      }

      enum BankAccountType {
        company
        individual
      }
      input BankAccountDetails {
        type: BankAccountType
        iban: String
        holderName: String
      }
    `;
  },

  resolver: {
    User: {
      reviews: async({ id }) => {
        const user = await User.find(id);
        if (!user) {
          return null;
        }

        await user.load(['reviews']);
        const reviews = user.related('reviews');

        return reviews.toArray().map(review => ({
          id: review.get('id'),
          message: review.get('message'),
          rank: review.get('rank')
        }));
      },

      postalAddress: async({ id }) => {
        const user = await User.find(id);
        const postalAddress = await user.getPostalAddress();

        if (!postalAddress) {
          return null;
        }
        return postalAddress.serialize();
      }
    },
    Query: {
      async currentUser(_, __, { user }) {
        if (!user) {
          return null;
        }
        return user.serialize();
      },

      provider: async (_, __, ___, { variableValues: { providerId } }) => {
        const user = await User.find(providerId);
        if (!user) {
          return null;
        }
        return user.serialize();
      },

      providers: async (_, __, ___, { variableValues: { limit, offset } }) => {
        const users = await User
          .query({ limit, offset })
          .query((qb) => {
            qb.where('is_provider', '=', true);
          })
          .fetchAll();

        return Promise.map(users.toArray(), async user => user.serialize());
      }
    },

    Mutation: {
      bankAccount: async (_, { details }, { user }) => {
        if (!user) {
          return false;
        }

        const stripeAccount = await user.stripeAccount();

        await stripe.accounts.update(stripeAccount.get('id'), {
          external_account: {
            account_holder_name: details.holderName,
            account_holder_type: details.type,
            object: 'bank_account',
            account_number: details.iban,
            country: user.get('country'),
            currency: 'EUR'
          }
        });

        stripeAccount.set('hasExternalAccount', true);
        await stripeAccount.save();

        return true;
      },

      providerBio: async (_, { bio }, { user }) => {
        if (!user) {
          return false;
        }
        user.set('bio', bio);
        await user.save();
        return true;
      },

      providerDisponibility: async (_, { disponibility }, { user }) => {
        if (!user) {
          return false;
        }
        user.set('isAvailable', disponibility);
        await user.save();
        return user.get('isAvailable');
      },

      setHourlyRate: async (_, { serviceCategoryId, hourlyRate }, { user }) => {
        if (!user) {
          return false;
        }

        const serviceCategory = await ServiceCategory.find(serviceCategoryId);
        if (!serviceCategory) {
          return false;
        }

        await ProviderPrice
          .create({
            user,
            serviceCategory,
            price: hourlyRate
          });

        return true;
      },

      personalDetails: async (_, { details }, { user }) => {
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
        } = details;

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
