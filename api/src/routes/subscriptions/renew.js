import Promise      from 'bluebird';
import knex         from '../../services/knex';
import Subscription from '../../models/subscription';

export const post = [
  async (req, res) => {
    const subscriptions = knex('subscriptions')
      .select('id')
      .whereRaw('next_renewal = current_date')
      .limit(10);

    await Promise.all(subscriptions.map((subscription) => {
      return Subscription.renew(subscription.id);
    }));

    res.send('');
  }
];
