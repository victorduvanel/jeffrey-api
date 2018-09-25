import Promise          from 'bluebird';
import moment           from 'moment';
import request          from 'request-promise';
import nativeBcrypt     from 'bcryptjs';
import uuid             from 'uuid';
import _                from 'lodash';

import buckets          from '../services/google/storage';
import bookshelf        from '../services/bookshelf';
import knex             from '../services/knex';
import stripe           from '../services/stripe';
import braintree        from '../services/braintree';
import googleService    from '../services/google';
import * as mjml        from '../services/mjml';
import { sendEmail }    from '../services/mailgun';

import { getLocale }    from '../locales';
import i18n             from '../lib/i18n';

import config           from '../config';

import Base             from './base';
import AccessToken      from './access-token';
import LoginToken       from './login-token';
import UserDocument     from './user-document';
import ServiceCategory  from './service-category';
import PostalAddress    from './postal-address';
import Business         from './business';
import Review           from './review';
import UserDevice       from './user-device';
import TOSAcceptance    from './tos-acceptance';
import StripeAccount    from './stripe-account';
import Country          from './country';

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

  /**
    * serviceCategories
    * @description Get user's categories for which a price have been defined
    * @param options Parameters of fetching
    * @param options.childrenOf Only fetch children categories of this one
    */
  async serviceCategories(options = { childrenOf: undefined }) {

    // Get the categories with price + parents of this categories
    const categoriesWithPrice = knex.raw(`
      WITH RECURSIVE recursive (id, slug) as
      (
        SELECT id, slug, parent_id
        FROM service_categories
        WHERE id IN(
          SELECT service_category_id AS id
          FROM provider_prices
          WHERE user_id = :userId
        )
        UNION ALL
        SELECT service_categories.id, service_categories.slug, service_categories.parent_id
        FROM recursive, service_categories
        WHERE service_categories.id = recursive.parent_id
      )
      SELECT DISTINCT id
      FROM recursive
    `, {
      userId: this.get('id')
    });

    const categories = await ServiceCategory
      .query((query) => {
        query.whereIn('id', categoriesWithPrice);

        if (typeof options.childrenOf !== 'undefined') {
          query = query.where('parent_id', options.childrenOf);
        }
      })
      .fetchAll();

    return categories;
  },

  async identifyDocuments() {
    const documents = UserDocument
      .where({
        owner_id: this.get('id'),
        purpose: 'identity_document'
      })
      .fetchAll();
    return documents;
  },

  unseenActivity: currentUserOnly(async function() {
    const res = await knex('conversation_participants')
      .where('user_id', this.get('id'))
      .whereNotNull('last_unseen_activity_at')
      .limit(1);

    return res.length > 0;
  }),

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
                .whereNot('author_id', userId)
                .where('provider_id', userId)
                .orWhere('client_id', userId)
            )
        );
      })
      .fetchAll();

    return reviews;
  },

  async color(_, { user }) {
    if (user) {
      const res = await knex.select('service_categories.color')
        .from('missions')
        .leftJoin('service_categories', 'missions.service_category_id', 'service_categories.id')
        .where('client_id', user.get('id'))
        .where('provider_id', this.get('id'))
        .orderBy('missions.created_at', 'DESC')
        .limit(1);

      if (res.length) {
        return res[0].color;
      }
    }
    return null;
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
                where provider_id = :userId or client_id = :userId
              )
          )
        and
          not author_id = :userId
      `, {
        userId
      });

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

  async country() {
    const postalAddress = await this.getPostalAddress();

    if (postalAddress) {
      const countryCode = postalAddress.get('country');
      if (countryCode) {
        return Country.findByCode(countryCode);
      }
    }
    return null;
  },

  async braintreeCustomer() {
    try {
      return await braintree.customer.find(this.get('id'));
    } catch (err) {
      if (err.type === 'notFoundError') {
        const res = await braintree.customer.create({
          id: this.get('id')
        });
        return res.customer;
      }
      throw err;
    }
  },

  async bankAccounts() {
    const stripeAccount = await this.stripeAccount(false);
    if (!stripeAccount) {
      return null;
    }

    const account = await new Promise((resolve, reject) => {
      stripe.accounts.retrieve(
        stripeAccount.get('id'),
        (err, account) => {
          if (err) {
            reject(err);
          } else {
            resolve(account);
          }
        }
      );
    });

    return account.external_accounts.data;
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

    let documents = await this.identifyDocuments();
    documents = _.orderBy(documents.toArray(), document => new Date(document.get('createdAt')), 'desc');
    const idDocument = documents[documents.length - 1];
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

  createAccessToken({ singleUse = false } = {}) {
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
    const loginLink = `${prefix}login/${loginToken.get('id')}`;
    const appRedirectLink = `${config.webappProtocol}://${config.webappHost}/app-link?link=${encodeURIComponent(loginLink)}`;

    const message = await mjml.render('email/login', locale, {
      user: {
        firstName: this.get('firstName'),
        lastName: this.get('lastName'),
        gender: this.get('gender')
      },
      loginLink: appRedirectLink
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
      uri: 'https://graph.facebook.com/v3.1/me?fields=id,first_name,last_name,email',
      auth: {
        bearer: token
      },
      form: {
        id_token: token
      }
    });

    const facebookUser = JSON.parse(response);

    let user = await this.forge({
      facebookId: facebookUser.id
    }).fetch();

    if (user) {
      if (facebookUser.email && !user.get('email')) {
        user.set('email', facebookUser.email);
      }

      if (facebookUser.first_name && !user.get('firstName')) {
        user.set('firstName', facebookUser.first_name);
      }

      if (facebookUser.last_name && !user.get('lastName')) {
        user.set('lastName', facebookUser.last_name);
      }

      if (user.hasChanged()) {
        await user.save();
      }
      return user;
    }

    if (facebookUser.email) {
      user = await this.forge({ email: facebookUser.email }).fetch();

      if (user) {
        return user;
      }
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

    props.isProvider = props.isProvider || false;

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
        qb.where('provider_prices.is_enabled', '=', true);
        qb.orderByRaw(`point(users.lat, users.lng) <@> point(${lat}, ${lng}) asc`);
        qb.limit(limit);
        qb.offset(offset);
      })
      .fetchAll();

    return providers;
  },

  findOrCreateFromPhoneNumber: async function(phoneNumber) {
    const user = await User.where({
      phone_number: phoneNumber
    }).fetch();

    if (user) {
      return user;
    }

    return User.create({ phoneNumber });
  }
});

export default bookshelf.model('User', User);
