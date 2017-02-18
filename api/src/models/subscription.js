import uuid      from 'uuid';

import bookshelf from '../services/bookshelf';
import Base      from './base';

export const InvalidFrequency = new Error('Invalid Frequency');

const Subscription = Base.extend({
  tableName: 'subscriptions',

  user() {
    return this.belongsTo('User');
  },

  product() {
    return this.belongsTo('Product');
  }
}, {
  create: async function({
    user,
    product,
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
        (id, user_id, product_id, frequency, renewal_date, created_at, updated_at)
        VALUES (:id, :userId, :productId, :frequency, CURRENT_DATE + interval '${renewIn}', NOW(), NOW())
      `,
      {
        id: uuid.v4(),
        userId: user.get('id'),
        productId: product.get('id'),
        frequency,
      }
    );

    return await new this({ id }).fetch();
  }
});

export default bookshelf.model('Subscription', Subscription);
