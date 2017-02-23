import uuid      from 'uuid';
import Promise   from 'bluebird';
import bookshelf from '../services/bookshelf';
import config    from '../config';
import Base      from './base';
import Invoice   from '../models/invoice';
import Product   from '../models/product';

const knex = bookshelf.knex;

export const InvalidFrequency = new Error('Invalid Frequency');

const Subscription = Base.extend({
  tableName: 'subscriptions',

  user() {
    return this.belongsTo('User');
  },

  phoneNumbers() {
    return this.belongsToMany('PhoneNumber');
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
        (id, user_id, frequency, last_renewal, next_renewal, created_at, updated_at)
        VALUES (:id, :userId, :frequency, current_date, current_date + interval '${renewIn}', NOW(), NOW())
      `,
      {
        id: id,
        userId: user.get('id'),
        frequency
      }
    );

    await bookshelf.knex.raw(
      `INSERT INTO phone_number_subscriptions
        (subscription_id, phone_number_id, created_at, updated_at)
        VALUES (:subscriptionId, :phoneNumberId, NOW(), NOW())
      `,
      {
        subscriptionId: id,
        phoneNumberId: phoneNumber.get('id'),
      }
    );

    return await new this({ id }).fetch();
  },

  renew: async function(id) {
    const subscription = await this.forge({ id })
      .fetch({
        require: true,
        withRelated: [
          'phoneNumbers',
          'user'
        ]
      });

    const user = subscription.related('user');
    const phoneNumbers = subscription.related('phoneNumbers').toArray();

    const outgoing = await Promise.reduce(phoneNumbers, async (total, phoneNumber) => {
      const outgoing = (await bookshelf.knex('messages')
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
        ))[0].total;

      return parseInt(outgoing, 10) + total;
    }, 0);

    const incoming = await Promise.reduce(phoneNumbers, async (total, phoneNumber) => {
      const incoming = (await bookshelf.knex('messages')
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
        ))[0].total;

      return parseInt(incoming, 10) + total;
    }, 0);

    const invoice = await Invoice.create({
      user,
      currency: 'eur'
    });

    const phoneNumberProduct = await Product.find(config.app.phoneNumberProductId);
    await invoice.addProduct({
      product  : phoneNumberProduct,
      quantity : phoneNumbers.length
    });

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
