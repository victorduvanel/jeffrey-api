import uuid         from 'uuid';
import bookshelf    from '../services/bookshelf';
import Base         from './base';
import User         from './user';
import pubsub, {
  conversationNewMissionActivityTopic,
  conversationMissionStatusChangedActivityTopic,
  conversationStartedMissionActivityTopic,
  conversationEndedMissionActivityTopic
} from '../services/graphql/pubsub';

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
    return {
      id: this.get('id'),
      price: this.get('price'),
      currency: this.get('priceCurrency'),
      status: this.get('status'),
      startDate: this.get('startDate'),
      startedDate: this.get('startedDate'),
      endDate: this.get('endDate'),
      endedDate: this.get('endedDate'),
      accepted: !!this.get('accepted'),
      createdAt: this.get('createdAt'),
    };
  },

  start: async function() {
    this.set('startedDate', new Date(Date.now()));

    this.save();

    // Send notification
    [this.get('providerId'), this.get('clientId')].forEach((user) => {
      pubsub.publish(
        conversationStartedMissionActivityTopic(user),
        { startedMission: this.serialize() }
      );
    });
  },

  end: async function() {
    this.set('endedDate', new Date(Date.now()));

    this.save();

    // Send notification
    [this.get('providerId'), this.get('clientId')].forEach((user) => {
      pubsub.publish(
        conversationEndedMissionActivityTopic(user),
        { endedMission: this.serialize() }
      );
    });
  },

  setStatus(status) {
    let recipientUserId;

    switch (status) {
      case 'accepted':
      case 'refused':
        recipientUserId = this.get('providerId');
        break;
      case 'canceled':
        recipientUserId = this.get('clientId');
        break;
      case 'pending':
        recipientUserId = null;
        break;
      default:
        throw new Error('Invalid status');
    }

    this.set('status', status);
    this.save();

    // Send notification
    if (recipientUserId) {
      pubsub.publish(
        conversationMissionStatusChangedActivityTopic(recipientUserId),
        { missionStatus: this.serialize()}
      );
    }
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

    const payload = mission.serialize();
    const firstName = provider.get('firstName');

    client.sendMessage({
      body: firstName ? `${firstName} sent you a new quote` : 'New quote'
    });

    pubsub.publish(
      conversationNewMissionActivityTopic(client.get('id')),
      {
        newMission: payload
      }
    );

    pubsub.publish(
      conversationNewMissionActivityTopic(provider.get('id')),
      {
        newMission: payload
      }
    );


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
