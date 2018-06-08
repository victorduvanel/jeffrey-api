import uuid      from 'uuid';
import bookshelf from '../services/bookshelf';
import Base      from './base';

const ProviderPrice = Base.extend({
  tableName: 'provider_prices',

  user() {
    return this.belongsTo('User');
  },

  serviceCategory() {
    return this.belongsTo('ServiceCategory');
  },

  serialize() {
    return {
      id: this.get('id'),
      price: this.get('price'),
      serviceCategoryId: this.get('serviceCategoryId'),
      currency: 'EUR'
    };
  }
}, {
  find: function(id) {
    return this.forge({ id }).fetch();
  },

  create: async function({ user, price, currency, serviceCategory }) {
    const id = uuid.v4();

    const res = await bookshelf.knex.raw(
      `INSERT INTO provider_prices
         (id, user_id, service_category_id, price, currency, created_at, updated_at)
       VALUES (
         :id,
         :userId,
         :serviceCategoryId,
         :price,
         :currency,
         NOW(),
         NOW()
       )
       ON CONFLICT (user_id, service_category_id) DO UPDATE
       SET
         price = EXCLUDED.price,
         currency = EXCLUDED.currency,
         updated_at = NOW()
       RETURNING id
      `,
      {
        id,
        userId: user.id,
        serviceCategoryId: serviceCategory.id,
        price,
        currency
      }
    );

    return this.find(res.rows[0].id);
  }
});

export default bookshelf.model('ProviderPrice', ProviderPrice);
