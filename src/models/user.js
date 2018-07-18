import Promise       from 'bluebird';
import moment        from 'moment';
import request       from 'request-promise';
import nativeBcrypt  from 'bcryptjs';
import uuid          from 'uuid';
import buckets       from '../services/google/storage';
import bookshelf     from '../services/bookshelf';
import knex          from '../services/knex';
import stripe        from '../services/stripe';
import Base          from './base';
import AccessToken   from './access-token';
import googleService from '../services/google';
import * as mjml     from '../services/mjml';
import { sendEmail } from '../services/mailgun';
import LoginToken    from './login-token';
import config        from '../config';
import UserDocument  from './user-document';
import PostalAddress from './postal-address';
import Business      from './business';
import Review        from './review';
import UserDevice    from './user-device';
import TOSAcceptance from './tos-acceptance';
import StripeAccount from './stripe-account';
import { getLocale } from '../locales';
import i18n          from '../lib/i18n';

import './postal-address';
import './business';

import { Unauthorized } from '../graphql/errors';
import { AppError}      from '../errors';

export const InvalidCredentials = () => new AppError('Invalid Credentials');
export const DuplicatedUser = () => new AppError('Duplicated User');
export const PasswordComplexity = () => new AppError('PasswordComplexity');

const bcrypt = Promise.promisifyAll(nativeBcrypt);

const currentUserOnly = function(callback) {
  return function(_, { user }) {
    if (!user || user.get('id') !== this.get('id')) {
      throw Unauthorized();
    }
    return callback.apply(this, arguments);
  };
};

const User = Base.extend({
  tableName: 'users',

  devices() {
    return this.hasMany('UserDevice', 'owner_id');
  },

  providerPrices() {
    return this.hasMany('ProviderPrice');
  },

  givenReviews() {
    return this.hasMany('Review', 'author_id');
  },

  stripeCard() {
    return this.hasMany('StripeCard');
  },

  /* GRAPHQL PROPS */

  async reviews() {
    const userId = this.id;

    const reviews = await Review
      .query((qb) => {
        qb.whereIn(
          'mission_id',
          knex('missions')
            .select('id')
            .whereIn(
              'id',
              knex('missions')
                .select('id')
                .where('provider_id', userId)
                .orWhere('client_id', userId)
            )
        );
      })
      .fetchAll();

    return reviews;
  },

  color() {
    return 'turquoise';
  },

  bio() {
    return this.get('bio');
  },

  isProvider() {
    return this.get('isProvider');
  },

  isAvailable: currentUserOnly(function() {
    return this.get('isAvailable');
  }),

  firstName() {
    return this.get('firstName');
  },

  lastName() {
    return this.get('lastName');
  },

  email: currentUserOnly(function() {
    return this.get('email');
  }),

  gender: currentUserOnly(function() {
    return this.get('gender');
  }),

  dateOfBirth: currentUserOnly(function() {
    if (this.get('dateOfBirth')) {
      return moment(this.get('dateOfBirth')).format('YYYY-MM-DD');
    }
    return null;
  }),

  profilePicture() {
    return this.get('profilePicture');
  },

  async rank() {
    const userId = this.get('id');
    const res = await knex
      .raw(`
        select round(
          avg(rank),
          2
        ) as rank
        from reviews
        where
          mission_id in (
            select id
            from missions
            where
              id in (
                select id
                from missions
                where provider_id = '${userId}' or client_id = '${userId}'
              )
          )
        and
          not author_id = '${userId}'
      `);

    return res.rows[0].rank;
  },

  paymentMethodStatus: currentUserOnly(async function() {
    await this.load('stripeCard');

    const cards = this.related('stripeCard');
    if (!cards.length) {
      return 'not_set';
    }

    const card = cards.at(0);
    const expYear = card.get('expYear');
    const expMonth = card.get('expMonth');

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
  }),

  /* !GRAPHQL PROPS */

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

  async saveMeta(props) {
    const deviceToken = props['device-token'];
    const deviceType = props['device-type'];
    const deviceLocale = props['device-locale'];

    if (deviceToken && deviceType && deviceLocale) {
      await this.associateDevice(deviceToken, deviceType, deviceLocale);
    }

    const { lat, lng } = props;

    if (typeof lat === 'string' && typeof lng === 'string') {
      this.set('lat', lat);
      this.set('lng', lng);
    }

    if (typeof deviceLocale === 'string') {
      this.set('locale', deviceLocale);
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
      throw PasswordComplexity();
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

  async onboardingProgress() {
    const progress = [];

    if (this.get('profilePicture') && this.get('bio')) {
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

  associateDevice(token, type, locale) {
    return UserDevice.create({ user: this, token, type, locale });
  },

  async pushNotification(notification) {
    await this.load(['devices']);

    const devices = this.related('devices');

    return Promise.all(devices.map((device) => {
      return device.pushNotification(notification);
    }));
  },

  async sendLoginEmail(rawLocale, uriPrefix) {
    const locale = getLocale(rawLocale);
    const emailAddress = this.get('email');
    const loginToken = await LoginToken.create({ user: this });

    const prefix = uriPrefix || `${config.webappProtocol}://${config.webappHost}/`;

    const message = await mjml.render('email/login', locale, {
      user: await this.serialize(),
      loginLink: `${prefix}login/${loginToken.get('id')}`,
    });

    return sendEmail({
      from: i18n[locale].formatMessage({
        id: 'emails.loginEmail.from',
        defaultMessage: '"Jeffrey" <noreply@jeffrey-services.com>'
      }),
      to: emailAddress,
      subject: i18n[locale].formatMessage({
        id: 'emails.loginEmail.subject',
        defaultMessage: 'Jeffrey - Sign in"',
      }),
      message
    });
  },

  async serialize() {
    console.warn('Stop using User::serialize');

    return {
      id: this.id,
      color: this.color(),
      bio: this.bio(),
      isProvider: this.isProvider(),
      isAvailable: this.isAvailable(),
      firstName: this.firstName(),
      lastName: this.lastName(),
      email: this.email(),
      gender: this.gender(),
      dateOfBirth: this.dateOfBirth(),
      phoneNumber: this.phoneNumber(),
      profilePicture: this.profilePicture(),
      rank: await this.rank(),
      paymentMethodStatus: await this.paymentMethodStatus()
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

    throw InvalidCredentials();
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

    let user = await this.forge({
      facebookId: facebookUser.id
    }).fetch();

    if (user) {
      return user;
    }

    user = await this.forge({ email: facebookUser.email }).fetch();

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
          throw DuplicatedUser();
        }

        throw err;
      });
  },

  findProviders: async function({
    serviceCategoryId,
    lat,
    lng,
    offset,
    limit
  }) {
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      throw new Error('invalid location parameter');
    }

    // const AREA_RADIUS = 6.21371; // 10km in miles

    const providers = await User
      .query((qb) => {
        qb.join('provider_prices', 'provider_prices.user_id', 'users.id');
        qb.where('users.is_provider', '=', true);
        qb.where('users.is_available', '=', true);
        qb.where('provider_prices.service_category_id', '=', serviceCategoryId);
        // qb.whereRaw(`point(users.lat, users.lng) <@> point(${lat}, ${lng}) <= ${AREA_RADIUS}`);
        qb.whereNotNull('provider_prices.price');
        qb.orderByRaw(`point(users.lat, users.lng) <@> point(${lat}, ${lng}) asc`);
        qb.limit(limit);
        qb.offset(offset);
      })
      .fetchAll();

    return providers;
  }
});

export default bookshelf.model('User', User);
