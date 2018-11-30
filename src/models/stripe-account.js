import stripeSvc from '../services/stripe';
import bookshelf from '../services/bookshelf';
import Base      from './base';

const StripeAccount = Base.extend({
  tableName: 'stripe_accounts',

  user() {
    return this.belongsTo('User');
  }
}, {
  create: async function(user) {
    const country = await user.country();

    if (!country) {
      throw new Error('user country not set');
    }

    let stripe;
    if (user.get('isTester')) {
      stripe = stripeSvc.test;
    } else {
      stripe = stripeSvc.production;
    }

    const account = await stripe.accounts.create({
      type: 'custom',
      country: country.get('code'),
      metadata: {
        user_id: user.get('id')
      }
    });

    return this.forge({
      id: account.id,
      userId: user.get('id'),
      environment: user.get('isTester') ? 'test' : 'production'
    })
      .save(null, { method: 'insert' });
  }
});

export default bookshelf.model('StripeAccount', StripeAccount);
