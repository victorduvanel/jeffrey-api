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

  isEnabled() {
    return this.get('isEnabled');
  },

  serialize() {
    return {
      id: this.get('id'),
      price: this.get('price'),
      serviceCategoryId: this.get('serviceCategoryId'),
      isEnabled: this.get('isEnabled'),
      currency: this.get('currency')
    };
  },

  amount() {
    return this.get('price');
  },

  currency() {
    return this.get('currency');
  }
}, {
  find: function(id) {
    return this.forge({ id }).fetch();
  },

  create: async function({ user, price, currency, serviceCategory, isEnabled }) {
    const id = uuid.v4();

    const res = await bookshelf.knex.raw(
      `INSERT INTO provider_prices
         (id, user_id, service_category_id, price, is_enabled, currency, created_at, updated_at)
       VALUES (
         :id,
         :userId,
         :serviceCategoryId,
         :price,
         :isEnabled,
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
        isEnabled,
        currency
      }
    );

    return this.find(res.rows[0].id);
  }
});

export default bookshelf.model('ProviderPrice', ProviderPrice);
