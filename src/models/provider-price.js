import uuid                         from 'uuid';
import bookshelf                    from '../services/bookshelf';
import Base                         from './base';

const ProviderPrice = Base.extend({
  tableName: 'provider_prices',

  user() {
    return this.belongsTo('User');
  },

  serviceCategory() {
    return this.belongsTo('ServiceCategory');
  }
}, {
  create: async function({ user, price, serviceCategory }) {
    const id = uuid.v4();

    return this.forge({
      id,
      userId: user.get('id'),
      serviceCategoryId: serviceCategory.get('id'),
      price
    })
      .save(null, { method: 'insert' });
  },
});

export default bookshelf.model('ProviderPrice', ProviderPrice);
