import Promise          from 'bluebird';
import moment           from 'moment';
import uuid             from 'uuid/v4';
import _                from 'lodash';
import bookshelf        from '../services/bookshelf';
import knex             from '../services/knex';
import stripeSvc        from '../services/stripe';

import config           from '../config';

import Base             from './base';
import AccessToken      from './access-token';
import UserDocument     from './user-document';
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

  async identifyDocuments() {
    const documents = UserDocument
      .where({
        owner_id: this.get('id'),
        purpose: 'identity_document'
      })
      .fetchAll();
    return documents;
  },

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

  async color() {
    const res = await knex.raw(`
      select
        count(service_categories.id), service_categories.color
      from missions
      left join
        service_categories on service_categories.id = missions.service_category_id
      where
        missions.provider_id = :providerId
      and
        missions.status = 'terminated'
      group by
        service_categories.id
    `, {
      providerId: this.get('id')
    });

    if (res.rowCount) {
      const rows = res.rows.map((row) => ({
        color: row.color,
        count: parseInt(row.count, 10)
      }));
      const total = rows.reduce((acc, row) => acc + row.count, 0);

      const colors = rows
        .map((row) => ({
          color: row.color,
          amount: row.count / total
        }))
        .sort((a, b) => b.amount - a.amount);

      return colors;
    }
    return null;
  },

  async totalMission() {
    const res = await knex.raw(`
      select count(*) as total
      from missions
      where
        provider_id = :providerId
      and
        status = 'terminated'
    `, {
      providerId: this.get('id')
    });

    if (res.rowCount) {
      return parseInt(res.rows[0].total, 10);
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

  isTester() {
    return this.get('isTester');
  },

  async totalReview() {
    const userId = this.get('id');
    const res = await knex
      .raw(`
        select count(*) as total_review
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

    return parseInt(res.rows[0].total_review, 10);
  },

  async avgPrice() {
    const userId = this.get('id');
    const res = await knex
      .raw(`
        select
          avg(price) as amount,
          price_currency as currency
        from missions
        where
          provider_id = :userId
        group by
          price_currency
        limit 1
      `, {
        userId
      });

    if (res.rowCount) {
      const { amount, currency } = res.rows[0];

      return {
        amount: parseInt(amount, 10),
        currency
      };
    }
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

  lastActivityAt() {
    return this.get('lastActivityAt');
  },

  createdAt() {
    return this.get('createdAt');
  },

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

  async bankAccounts() {
    const stripeAccount = await this.stripeAccount(false);

    if (!stripeAccount) {
      return null;
    }

    let stripe;
    if (this.get('isTester')) {
      stripe = stripeSvc.test;
    } else {
      stripe = stripeSvc.production;
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
    let stripe;
    if (this.get('isTester')) {
      stripe = stripeSvc.test;
    } else {
      stripe = stripeSvc.production;
    }

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

    if (!documents.length) {
      throw new Error('Identity document not provided');
    }

    const idDocument = documents[documents.length - 1];
    const filename = idDocument.get('uri').split('/').splice(4).join('/');

    // const region = 'EU';
    // const bucket = buckets[region];

    // const fileContent = await bucket
    //   .file(filename)
    //   .download();
    throw new Error('User file storage not implemented');

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

    if (business && business.get('name')) {
      accountAttributes.business_name = business.get('name');
    }

    await stripe.accounts.update(stripeAccount.get('id'), accountAttributes);
  },

  createAccessToken() {
    return AccessToken.create({ user: this });
  },

  bumpLastActivity() {
    const userId = this.get('id');
    return knex
      .raw(`
        UPDATE users
        SET last_activity_at = NOW()
        WHERE
          id = :userId
        AND
          (last_activity_at < NOW() OR last_activity_at IS NULL)
      `, {
        userId
      })
      .then();
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

  async hasDocument(documentType) {
    const idDocument = await UserDocument.findDocuments(this, documentType);
    return idDocument.length > 0;
  },

  async hasIdentityDocument() {
    return this.hasDocuments('identity_document');
  },


  async stripeCustomer() {
    if (this.get('stripeCustomerId')) {
      return this.get('stripeCustomerId');
    }

    let stripe;
    if (this.get('isTester')) {
      stripe = stripeSvc.test;
    } else {
      stripe = stripeSvc.production;
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

    // const stripeAccount = await this.stripeAccount(false);
    // if (stripeAccount && stripeAccount.get('hasExternalAccount')) {
    //   progress.push('bank-details');
    // }

    // if (await this.hasIdentityDocument()) {
    //   progress.push('identity-document');
    // }

    const country = await this.country();
    if (country && country.get('requiresCivilLiabilityInsurance')) {
      if (await this.hasDocument('civil_liability_insurance')) {
        progress.push('civil-liability-insurance');
      }
    }

    return progress;
  },

  sendMessage(notification) {
    return this.pushNotification(notification);
  },

  associateDevice(token, type, locale) {
    return UserDevice.create({ user: this, token, type, locale });
  },

  async setBadge(value) {
    await this.load(['devices']);
    const devices = this.related('devices');
    return Promise.all(devices.map(device => device.setBadge(value)));
  },

  async pushNotification(notification) {
    await this.load(['devices']);

    const devices = this.related('devices');

    return Promise.all(devices.map((device) => {
      return device.pushNotification(notification);
    }));
  },

  async getTokens() {
    const accessToken = await this.createAccessToken({});

    return {
      access_token: accessToken.get('token'),
      token_type: 'Bearer'
    };
  }
}, {
  find: function(id) {
    return this.forge({ id }).fetch();
  },

  create: async function(props) {
    const id = uuid();

    props.isProvider = props.isProvider || false;

    return this.forge({
      id,
      isTester: !config.PRODUCTION,
      lastActivityAt: knex.raw('NOW()'),
      ...props
    })
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
