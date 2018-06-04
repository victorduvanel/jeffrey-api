import stripe    from '../services/stripe';
import bookshelf from '../services/bookshelf';
import Base      from './base';

const StripeAccount = Base.extend({
  tableName: 'stripe_accounts',

  user() {
    return this.belongsTo('User');
  }
}, {
  create: async function(user) {
    const account = await stripe.accounts.create({
      type: 'custom',
      // country: user.get('country'),
      metadata: {
        user_id: user.get('id')
      }
    });

    return this.forge({
      id: account.id,
      userId: user.get('id')
    })
      .save(null, { method: 'insert' });
  }
});

export default bookshelf.model('StripeAccount', StripeAccount);
