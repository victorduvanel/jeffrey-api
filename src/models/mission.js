import uuid      from 'uuid';
import bookshelf from '../services/bookshelf';
import Base      from './base';
import User      from './user';

const Mission = Base.extend({
  tableName: 'missions',

  client() {
    return this.belongsTo('User', 'client_id');
  },

  provider() {
    return this.belongsTo('User', 'provider_id');
  },

  serviceCategory() {
    return this.belongsTo('ServiceCategory');
  },

  serialize() {
    const startDate = this.get('startDate').toISOString();
    let endDate;
    if (this.get('endDate')) {
      endDate = this.get('endDate').toISOString();
    }

    return {
      id: this.get('id'),
      price: this.get('price'),
      currency: this.get('priceCurrency'),
      status: this.get('status'),
      startDate,
      endDate,
      accepted: !!this.get('accepted'),
      createdAt: this.get('createdAt'),
      serviceCategory: this.get('serviceCategoryId')
    };
  }
}, {
  find: function(id) {
    return this.forge({ id }).fetch();
  },

  create: async function({ startDate, price, currency, provider, client, serviceCategory }) {
    const id = uuid.v4();

    const mission = await Mission
      .forge({
        id,
        startDate,
        price,
        priceCurrency: currency,
        providerId: provider.get('id'),
        clientId: client.get('id'),
        serviceCategoryId: serviceCategory.get('id'),
        status: 'pending'
      })
      .save(null, { method: 'insert' });

    return mission;
  },

  clientHistory2: async function(client) {
    const userIds = await bookshelf.knex
      .select('provider_id')
      .from('missions')
      .where('client_id', '=', client.get('id'))
      .groupBy('provider_id');

    return User
      .query((qb) => {
        qb.whereIn(
          'id',
          userIds.map(user => user.provider_id)
        );
      })
      .fetchAll();
  },

  clientHistory: async ({user, providerId}) => {
    const missions = await Mission
      .query((qb) => {
        qb.where('client_id', '=', user.get('id'));
        qb.where('provider_id', '=', providerId);
        qb.where('status', '=', 'accepted');
        qb.whereNotNull('end_date');
      })
      .fetchAll();
    return missions;
  },

  providerHistory: async function(provider) {
    const userIds = await bookshelf.knex
      .select('client_id')
      .from('missions')
      .where('provider_id', '=', provider.get('id'))
      .groupBy('client_id');

    return User
      .query((qb) => {
        qb.whereIn(
          'id',
          userIds.map(user => user.client_id)
        );
      })
      .fetchAll();
  }
});

export default bookshelf.model('Mission', Mission);
