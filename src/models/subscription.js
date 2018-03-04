import uuid      from 'uuid';
import bookshelf from '../services/bookshelf';
import config    from '../config';
import Base      from './base';
import Invoice   from '../models/invoice';
import Product   from '../models/product';

const knex = bookshelf.knex;

export const InvalidFrequency = new Error('Invalid Frequency');
export const SubscriptionNotFound = new Error('Subscription Not Found');
export const SubscriptionAlreadyCanceled = new Error(
  'Subscription Already Canceled'
);

const Subscription = Base.extend({
  tableName: 'subscriptions',

  user() {
    return this.belongsTo('User');
  },

  phoneNumber() {
    return this.belongsTo('PhoneNumber');
  },

  async cancel() {
    if (this.get('canceledAt')) {
      throw SubscriptionAlreadyCanceled;
    }

    const phoneNumber = await this.load('phoneNumber');

    await phoneNumber.detach();

    this.set('canceledAt',  bookshelf.knex.raw('NOW()'));

    await this.save();
  }
}, {
  create: async function({
    user,
    phoneNumber,
    frequency
  }) {
    const id = uuid.v4();

    let renewIn;
    switch (frequency) {
      case 'yearly':
        renewIn = '1 year';
        break;
      case 'monthly':
        renewIn = '1 month';
        break;
      default:
        throw InvalidFrequency;
    }

    await bookshelf.knex.raw(
      `INSERT INTO subscriptions
        (id, user_id, phone_number_id, frequency, last_renewal, next_renewal, created_at, updated_at)
        VALUES (:id, :userId, :phoneNumberId, :frequency, current_date, current_date + interval '${renewIn}', NOW(), NOW())
      `,
      {
        id: id,
        userId: user.get('id'),
        phoneNumberId: phoneNumber.get('id'),
        frequency
      }
    );

    return await new this({ id }).fetch();
  },

  find: async function({ user, phoneNumber }) {
    const subscription = await this.forge({
      userId: user.get('id'),
      phoneNumberId: phoneNumber.get('id')
    }).fetch();

    if (!subscription) {
      throw SubscriptionNotFound;
    }

    return subscription;
  },

  renew: async function(id) {
    const subscription = await this.forge({ id })
      .fetch({
        require: true,
        withRelated: [
          'phoneNumber',
          'user'
        ]
      });

    const user = subscription.related('user');
    const phoneNumber = subscription.related('phoneNumber');

    /*
    const outgoing = parseInt((await bookshelf.knex('messages')
      .count('* as total')
      .where('from_id', '=', phoneNumber.get('id'))
      .where(
        knex.raw('"created_at"::date'),
        '>=',
        knex.raw(`'${subscription.get('lastRenewal').toISOString()}'::date`)
      )
      .where(
        knex.raw('"created_at"::date'),
        '<',
        knex.raw(`'${subscription.get('nextRenewal').toISOString()}'::date`)
      ))[0].total, 10);

    const incoming = parseInt((await bookshelf.knex('messages')
      .count('* as total')
      .where('to_id', '=', phoneNumber.get('id'))
      .where(
        knex.raw('"created_at"::date'),
        '>=',
        knex.raw(`'${subscription.get('lastRenewal').toISOString()}'::date`)
      )
      .where(
        knex.raw('"created_at"::date'),
        '<',
        knex.raw(`'${subscription.get('nextRenewal').toISOString()}'::date`)
      ))[0].total, 10);
    */

    const invoice = await Invoice.create({
      user,
      currency: 'eur'
    });

    const phoneNumberProduct = await Product.find(config.app.phoneNumberProductId);
    await invoice.addProduct({
      product  : phoneNumberProduct
    });

    /*
    const incomingMessageProduct = await Product.find(config.app.incomingMessageProductId);
    await invoice.addProduct({
      product  : incomingMessageProduct,
      quantity : incoming
    });

    const outgoingMessageProduct = await Product.find(config.app.outgoingMessageProductId);
    await invoice.addProduct({
      product  : outgoingMessageProduct,
      quantity : outgoing
    });
    */

    let charged = false;
    try {
      await invoice.charge();
      charged = true;
    } catch (err) {
      if (err !== Invoice.PaymentFailed && err !== Invoice.UserCannotBeCharged) {
        throw err;
      }
    }

    const frequency = subscription.get('frequency');

    let renewIn;
    switch (frequency) {
      case 'yearly':
        renewIn = '1 year';
        break;
      case 'monthly':
        renewIn = '1 month';
        break;
      default:
        throw InvalidFrequency;
    }

    await bookshelf.knex.raw(
      `UPDATE subscriptions
       SET
         last_renewal = :lastRenewal,
         next_renewal = next_renewal + interval '${renewIn}',
         updated_at   = NOW()
       WHERE id = :id
      `,
      {
        id: subscription.get('id'),
        lastRenewal: subscription.get('nextRenewal')
      }
    );

    return charged;
  }
});

export default bookshelf.model('Subscription', Subscription);
