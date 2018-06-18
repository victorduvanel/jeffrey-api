import Promise          from 'bluebird';
import uuid             from 'uuid';
import bookshelf        from '../../services/bookshelf';
import Base             from '../base';
import User             from '../user';
import i18n             from '../../lib/i18n';
import { getLocale }    from '../../locales';
import pubsub, {
  conversationNewMissionActivityTopic,
  conversationMissionStatusChangedActivityTopic,
  conversationStartedMissionActivityTopic,
  conversationEndedMissionActivityTopic
} from '../../services/graphql/pubsub';

import { Unauthorized } from '../../graphql/errors';

import status, { InvalidNewStatus } from './status';

/* status enum */
export const PENDING    = 'pending';
export const CANCELED   = 'canceled';
export const ACCEPTED   = 'accepted';
export const REFUSED    = 'refused';
export const STARTED    = 'started';
export const ABORTED    = 'aborted';
export const CONFIRMED  = 'confirmed';
export const TERMINATED = 'terminated';


const Mission = Base.extend({
  tableName: 'missions',


  /* graphql props */

  price() {
    return this.get('price');
  },

  currency() {
    return this.get('priceCurrency');
  },

  status() {
    return this.get('status');
  },

  startDate() {
    return this.get('startDate');
  },

  startedDate() {
    return this.get('startedDate');
  },

  endDate() {
    return this.get('endDate');
  },

  endedDate() {
    return this.get('endedDate');
  },

  accepted() {
    return !!this.get('accepted');
  },

  createdAt() {
    return this.get('createdAt');
  },

  /* !graphql props */

  client() {
    return this.belongsTo('User', 'client_id');
  },

  provider() {
    return this.belongsTo('User', 'provider_id');
  },

  serviceCategory() {
    return this.belongsTo('ServiceCategory');
  },

  async send5minNotif() {
    await this.load(['provider', 'client']);

    const provider = this.related('provider');
    const client = this.related('client');

    const providerLocale = getLocale(provider.get('locale'));
    await provider.pushNotification({
      body: i18n[providerLocale].formatMessage({
        id: 'notifications.nextMissionFiveMinutesProviderAlert',
        defaultMessage: 'Your next mission starts in 5 minutes'
      })
    });

    const clientLocale = getLocale(client.get('locale'));
    await client.pushNotification({
      body: i18n[clientLocale].formatMessage({
        id: 'notifications.nextMissionFiveMinutesClientAlert',
        defaultMessage: 'Your Jeffrey will start in 5 minutes'
      })
    });
  },

  start: async function() {
    this.set('startedDate', bookshelf.knex.raw('NOW()'));
    this.set('status', 'started');
    await this.save();

    // Send notification
    [this.get('providerId'), this.get('clientId')].forEach((user) => {
      pubsub.publish(
        conversationStartedMissionActivityTopic(user),
        { startedMission: this }
      );
    });
  },

  end: async function() {
    this.set('endedDate', bookshelf.knex.raw('NOW()'));

    await this.save();

    // Send notification
    [this.get('providerId'), this.get('clientId')].forEach((user) => {
      pubsub.publish(
        conversationEndedMissionActivityTopic(user),
        { endedMission: this }
      );
    });
  },







  async setStatus(newStatus, user) {
    const isProvider = this.get('providerId') === user.get('id');
    const isClient = this.get('clientId') === user.get('id');

    if (!isProvider && !isClient) {
      throw Unauthorized();
    }

    if (!status.hasOwnProperty(newStatus)) {
      throw InvalidNewStatus();
    }

    const currentStatus = this.get('status');

    status[newStatus].trigger(currentStatus, isProvider ? 'provider' : 'client');
    this.set('status', newStatus);
    await this.save();

    // Send notification
    // if (recipientUserId) {
    //   pubsub.publish(
    //     conversationMissionStatusChangedActivityTopic(recipientUserId),
    //     { missionStatus: this }
    //   );
    // }
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

    const firstName = provider.get('firstName');

    client.sendMessage({
      body: firstName ? `${firstName} sent you a new quote` : 'New quote'
    });

    pubsub.publish(
      conversationNewMissionActivityTopic(client.get('id')),
      {
        newMission: mission
      }
    );

    pubsub.publish(
      conversationNewMissionActivityTopic(provider.get('id')),
      {
        newMission: mission
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
  },

  startMissions: async function() {
    const res = await bookshelf.knex
      .raw(`
        update missions
        set
          users_notified = true
        where
          id in (
            select id from missions where users_notified = false limit 10
          )
        and
          start_date - NOW() <= interval '5 minutes'
        returning id
      `);

    return Promise.map(res.rows, async ({ id }) => {
      const mission = await Mission.find(id);
      return mission.send5minNotif();
    });
  }
});

export default bookshelf.model('Mission', Mission);
