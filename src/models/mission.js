import uuid            from 'uuid';
import bookshelf       from '../services/bookshelf';
import Base            from './base';
import User            from './user';
import ServiceCategory from './service-category';

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
        serviceCategoryId: serviceCategory.get('id')
      })
      .save(null, { method: 'insert' });

    return mission;
  },

  clientHistory2: async function(client) {
    //console.log('client: ', client);
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

  clientHistory: async ({user, providerId, serviceCategoryId}) => {

    const missions = await Mission
      .query((qb) => {
        qb.where('client_id', '=', user.get('id'))
        qb.where('provider_id', '=', providerId)
        qb.where('status', '=', 'accepted')
        qb.whereRaw('end_date <= ?', [new Date()]);
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
  },

  graphqlDef: function() {
    return `
      enum MissionStatus {
        accepted
        refused
        canceled
        pending
      }
      type Mission {
        id: ID!
        status: MissionStatus!
        client: User!
        provider: User!
        price: Int!
        currency: Currency!
        startDate: String!
        endDate: String
        createdAt: Date!
        serviceCategory: String
      }
    `;
  },

  resolver: {
    Mission: {
      client: async({ id }) => {
        const mission = await Mission.find(id);
        await mission.load(['client']);
        return mission.related('client').serialize();
      },
      provider: async({ id }) => {
        const mission = await Mission.find(id);
        await mission.load(['provider']);
        return mission.related('provider').serialize();
      }
    },
    Mutation: {
      newMission: async (_, { startDate, clientId, price, serviceCategoryId }, { user }) => {
        if (!user) {
          return false;
        }

        const client = await User.find(clientId);
        if (!client) {
          return false;
        }

        const serviceCategory = await ServiceCategory.find(serviceCategoryId);
        if (!ServiceCategory) {
          return false;
        }

        await Mission.create({
          startDate,
          price,
          currency: 'EUR',
          status: 'pending',
          provider: user,
          client,
          serviceCategory
        });

        return true;
      }
    },
    Query: {
      clientHistory: async (_, { providerId, serviceCategoryId }, { user }) => {
        if (!user) {
          return null;
        }

        const missions = await Mission.clientHistory({user, providerId, serviceCategoryId});
        return missions.toArray().map(mission => mission.serialize());
      },
      clientHistory2: async (_, __, { user }) => {
        if (!user) {
          return null;
        }

        const providers = await Mission.clientHistory(user);
        return providers.toArray().map(user => user.serialize());
      },
      providerHistory: async (_, __, { user }) => {
        if (!user) {
          return null;
        }

        const providers = await Mission.providerHistory(user);
        return providers.toArray().map(user => user.serialize());
      },
    }
  }
});

export default bookshelf.model('Mission', Mission);
