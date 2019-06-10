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
      serviceCategoryId: this.get('serviceCategoryId'),
      isEnabled: this.get('isEnabled')
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

  create: async function({ user, serviceCategory, isEnabled }) {
    const id = uuid.v4();

    const res = await bookshelf.knex.raw(
      `INSERT INTO provider_prices
         (id, user_id, service_category_id, is_enabled, created_at, updated_at)
       VALUES (
         :id,
         :userId,
         :serviceCategoryId,
         :isEnabled,
         NOW(),
         NOW()
       )
       ON CONFLICT (user_id, service_category_id) DO UPDATE
       SET
         is_enabled = EXCLUDED.is_enabled,
         updated_at = NOW()
       RETURNING id
      `,
      {
        id,
        userId: user.id,
        serviceCategoryId: serviceCategory.id,
        isEnabled
      }
    );

    return this.find(res.rows[0].id);
  }
});

export default bookshelf.model('ProviderPrice', ProviderPrice);
