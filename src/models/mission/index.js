import Promise          from 'bluebird';
import _                from 'lodash';
import uuid             from 'uuid';
import assert           from 'assert';
import bookshelf        from '../../services/bookshelf';
import knex             from '../../services/knex';
import Base             from '../base';
import User             from '../user';
import stripe           from '../../services/stripe';
import i18n             from '../../lib/i18n';
import { getLocale }    from '../../locales';
import pubsub, {
  conversationNewMissionActivityTopic,
  conversationMissionStatusChangedActivityTopic,
  conversationEndedMissionActivityTopic,
  conversationStartedMissionActivityTopic,
  newMissionRequestTopic,
  missionShouldStartActivityTopic
} from '../../services/graphql/pubsub';

import { Unauthorized } from '../../graphql/errors';

import status, { InvalidNewStatus } from './status';

const serviceFees = [
  {
    max: 1000, fee: 0.2
  },
  {
    max: 1500, fee: 0.18
  },
  {
    max: 1800, fee: 0.15
  },
  {
    max: 2000, fee: 0.12
  },
  {
    max: 2500, fee: 0.1
  },
  {
    max: 3000, fee: 0.08
  },
  {
    max: 3500, fee: 0.07
  },
  {
    max: 4500, fee: 0.06
  },
  {
    max: Number.MAX_SAFE_INTEGER, fee: 0.06
  }
];

export const getServiceFee = (price) => {
  let serviceFee = 0.2;

  _.forEach(serviceFees, (fee) => {
    if (price > fee.max) {
      serviceFee = fee.fee;
    } else {
      return false;
    }
  });

  return serviceFee;
};

/* status enum */
export const PENDING    = 'pending';
export const CANCELED   = 'canceled';
export const ACCEPTED   = 'accepted';
export const REFUSED    = 'refused';
export const STARTED    = 'started';
export const ABORTED    = 'aborted';
export const CONFIRMED  = 'confirmed';
export const TERMINATED = 'terminated';

/* type enum */
export const HOURLY_RATE = 'hourly-rate';
export const FIXED_PRICE = 'fixed-price';

const Mission = Base.extend({
  tableName: 'missions',

  reviews() {
    return this.hasMany('Review');
  },

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

  canceledBy() {
    return this.get('canceledBy');
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

  totalCost() {
    if (this.get('type') === 'fixed-price') {
      return this.get('price');
    }

    if (!this.get('startedDate') || !this.get('endedDate') || !this.get('price')) {
      return null;
    }

    return Mission.computeMissionTotalCost(this.get('startedDate'), this.get('endedDate'), this.get('price'));
  },

  // paymentMethod() {
  //   return this.get('paymentMethod');
  // },

  location() {
    return this.get('location');
  },

  // description() {
  //   return this.get('description');
  // },

  type() {
    return _.camelCase(this.get('type'));
  },

  lat() {
    return this.get('lat');
  },

  lng() {
    return this.get('lng');
  },

  providerLat() {
    return this.get('providerLat');
  },

  providerLng() {
    return this.get('providerLng');
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
    provider.pushNotification({
      body: i18n[providerLocale].formatMessage({
        id: 'notifications.nextMissionFiveMinutesProviderAlert',
        defaultMessage: 'Your next mission starts in 5 minutes'
      })
    });

    pubsub.publish(
      missionShouldStartActivityTopic(provider.get('id')),
      { missionShouldStart: this.id }
    );

    const clientLocale = getLocale(client.get('locale'));
    client.pushNotification({
      body: i18n[clientLocale].formatMessage({
        id: 'notifications.nextMissionFiveMinutesClientAlert',
        defaultMessage: 'Your Jeffrey will start in 5 minutes'
      })
    });
  },

  start: async function() {
    this.set('startedDate', knex.raw('NOW()'));

    await this.save();
    await this.refresh();

    // Send notification
    [this.get('providerId'), this.get('clientId')].forEach((user) => {
      pubsub.publish(
        conversationStartedMissionActivityTopic(user),
        { startedMission: this.id }
      );
    });
  },

  end: async function() {
    this.set('endedDate', bookshelf.knex.raw('NOW()'));
    this.set('payTentativeAt', bookshelf.knex.raw('NOW() + interval \'48 hours\''));
    await this.save();

    // Send notification
    [this.get('providerId'), this.get('clientId')].forEach((user) => {
      pubsub.publish(
        conversationEndedMissionActivityTopic(user),
        { endedMission: this.id }
      );
    });
  },

  async setProvider(provider) {
    const res = await knex('missions')
      .update({
        status: 'accepted',
        provider_id: provider.get('id'),
        updated_at: knex.raw('NOW()')
      })
      .where('id', this.get('id'))
      .whereNull('provider_id');

    await this.refresh();

    if (res === 1) {
      pubsub.publish(
        conversationMissionStatusChangedActivityTopic(this.get('clientId')),
        {
          missionId: this.id
        }
      );

      await this.send5minNotif();
      return true;
    }

    return false;
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

    if (newStatus === CANCELED) {
      this.set('canceledBy', user.get('id'));
    }

    await this.save();

    if (newStatus === TERMINATED) {
      await this.end();
    }

    if (newStatus === STARTED) {
      await this.start();
    }

    this.refresh();

    pubsub.publish(
      conversationMissionStatusChangedActivityTopic(this.get('clientId')),
      {
        missionId: this.id
      }
    );

    pubsub.publish(
      conversationMissionStatusChangedActivityTopic(this.get('providerId')),
      {
        missionId: this.id
      }
    );
  },

  providerGain() {
    return Mission.computeProviderGain(this.get('startedDate'), this.get('endedDate'), this.get('price'));
  },

  async charge() {
    assert(this.get('paidAt') === null, 'Mission already paid');
    assert(this.get('status') === TERMINATED, 'Invalid mission status');
    assert(!!this.get('startedDate'), 'Mission started date not set');
    assert(!!this.get('endedDate'), 'Mission ended date not set');
    assert(!!this.get('price'), 'Mission price not set');
    assert(!!this.get('priceCurrency'), 'Mission price currency not set');

    const totalCost = this.totalCost();

    assert(totalCost > 100, 'Total cost must be greater than 100');

    switch (this.get('priceCurrency')) {
      case 'EUR':
      case 'GBP':
      case 'USD':
      case 'CAD':
      case 'KRW':
      case 'CHF':
        assert(totalCost < 40000, 'Payment amount limited to 400');
        break;
      case 'AED':
        assert(totalCost < 150000, 'Payment amount limited to 1500');
        break;
      case 'JPY':
        assert(totalCost < 5000000, 'Payment amount limited to ¥50000');
        break;
      default:
        assert(false, `Payment hard coded limit not set for the currency ${this.get('priceCurrency')}`);
    }

    await this.load(['provider', 'client']);

    const provider = this.related('provider');
    const client = this.related('client');

    assert(!!provider, 'Mission’s provider not set');
    assert(!!client, 'Mission’s client not set');
    assert(!!client.get('stripeCustomerId'), 'Client’s stripe customer id not set');

    await client.load('stripeCard');
    const stripeCards = client.related('stripeCard');
    assert(stripeCards.length > 0, 'Client’s payment method not set');

    assert(provider.get('isProvider'), 'Mission’s provider is not a provider');

    const stripeAccount = await provider.stripeAccount(false);
    assert(!!stripeAccount, 'Provider stripe account not set');
    assert(!!stripeAccount.get('hasExternalAccount'), 'Provider external account not set');

    const r = await stripe.charges.create({
      amount: totalCost,
      currency: this.get('priceCurrency'),
      customer: client.get('stripeCustomerId'),
      destination: {
        amount: this.providerGain(),
        account: stripeAccount.get('id')
      }
    });

    if (r.status === 'succeeded') {
      this.set('paidAt', knex.raw('NOW()'));
      await this.save();
      return totalCost;
    } else {
      throw new Error(`Invalid stripe payment status: ${r.status}`);
    }
  },

  async findProvider() {
    const providers = await User.where({ is_provider: true }).fetchAll();

    providers.forEach((provider) => {
      pubsub.publish(
        newMissionRequestTopic(provider.get('id')),
        {
          missionRequest: this.get('id')
        }
      );
    });
  }
}, {
  find: function(id) {
    return this.forge({ id }).fetch();
  },

  create: async function({
    startDate,
    price = null,
    currency = null,
    provider = null,
    client,
    serviceCategory,
    type,
    // description = null,
    // paymentMethod = null,
    lat = null,
    lng = null,
    location = null
  }) {
    const id = uuid.v4();

    const mission = await Mission
      .forge({
        id,
        startDate,
        price,
        usersNotified: false,
        priceCurrency: currency,
        providerId: provider ? provider.get('id') : null,
        clientId: client.get('id'),
        serviceCategoryId: serviceCategory.get('id'),
        type,
        status: 'pending',
        // description,
        // paymentMethod,
        lat,
        lng,
        location
      })
      .save(null, { method: 'insert' });

    if (provider) {
      const firstName = provider.get('firstName');

      client.sendMessage({
        body: firstName ? `${firstName} sent you a new quote` : 'New quote'
      });

      pubsub.publish(
        conversationNewMissionActivityTopic(client.get('id')),
        {
          newMission: mission.id
        }
      );

      pubsub.publish(
        conversationNewMissionActivityTopic(provider.get('id')),
        {
          newMission: mission.id
        }
      );
    }

    return mission;
  },

  clientHistory: async ({ user, providerId }) => {
    const missions = await Mission
      .query((qb) => {
        qb.where('client_id', '=', user.get('id'));
        if (providerId) {
          qb.where('provider_id', '=', providerId);
        }
        // qb.where('status', '=', 'terminated');
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
            select id
              from missions
            where
              status = 'accepted'
              and
              (
                users_notified = false
                or
                users_notified is null
              )
            limit 10
          )
        and
          start_date - NOW() <= interval '5 minutes'
        returning id
      `);

    return Promise.map(res.rows, async ({ id }) => {
      const mission = await Mission.find(id);
      return mission.send5minNotif();
    });
  },

  computeMissionTotalCost(startDate, endDate, pricePerHour) {
    const length = Math.ceil(endDate.getTime() / 1000) - Math.ceil(startDate.getTime() / 1000);
    return Math.ceil((length / 60 / 60) * pricePerHour);
  },

  computeProviderGain(startDate, endDate, pricePerHour) {
    const serviceFee = getServiceFee(pricePerHour);
    const totalCost = Mission.computeMissionTotalCost(startDate, endDate, pricePerHour);
    const totalServiceFee = Math.ceil(totalCost * serviceFee);
    return totalCost - totalServiceFee;
  }
});

export default bookshelf.model('Mission', Mission);
