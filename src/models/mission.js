import moment          from 'moment';
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
    const startDate = moment(this.get('startDate')).format('YYYY-MM-DD HH:mm:ss');
    return {
      id: this.get('id'),
      price: this.get('price'),
      currency: this.get('priceCurrency'),
      startDate
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

  providerHistory: async function(client) {
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

  graphqlDef: function() {
    return `
      type Mission {
        id: ID!
        client: User!
        provider: User!
        price: Int!
        currency: Currency!
        startDate: String!
      }
    `;
  },

  resolver: {
    Mission: {
      client: async({ id }) => {
        const mission = await Mission.find(id);
        await mission.load(['client']);
        return mission.related('client');
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
          provider: user,
          client,
          serviceCategory
        });

        return true;
      }
    },
    Query: {
      history: async (_, __, { user }) => {
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
