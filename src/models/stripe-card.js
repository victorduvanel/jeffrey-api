import bookshelf from '../services/bookshelf';
import stripe    from '../services/stripe';
import Base      from './base';

export const UnsupportedPaymentType = new Error('Unsupported Payment Type');

const StripeCard = Base.extend({
  tableName: 'stripe_cards',

  user() {
    return this.belongsTo('User');
  },

  async addCard(token) {
    const id = this.get('id');
    const source = await stripe.customers.createSource(id, {
      source: token
    });

    await stripe.customers.update(id, {
      default_source: source.id
    });

    this.set({
      type       : source.brand,
      lastFour   : source.last4,
      holderName : source.name,
      expMonth   : source.exp_month,
      expYear    : source.exp_year
    });

    await this.save();
  }
}, {
  create: async function({ user, card: { number, expMonth, expYear, cvc, holderName }}) {
    const stripeCustomer = await user.stripeCustomer();

    const paymentInfo = await stripe.customers.createSource(stripeCustomer, {
      source: {
        object: 'card',
        number,
        exp_month: expMonth,
        exp_year: expYear,
        cvc,
        name: holderName
      }
    });

    return this
      .forge({
        id         : paymentInfo.id,
        userId     : user.get('id'),
        type       : paymentInfo.brand,
        lastFour   : paymentInfo.last4,
        holderName : paymentInfo.name,
        expMonth   : paymentInfo.exp_month,
        expYear    : paymentInfo.exp_year
      })
      .save(null, { method: 'insert' });
  }
});

export default bookshelf.model('StripeCard', StripeCard);
