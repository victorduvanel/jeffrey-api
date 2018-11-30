import Promise      from 'bluebird';
import bookshelf    from '../services/bookshelf';
import stripeSvc    from '../services/stripe';
import Base         from './base';
import { AppError } from '../errors';

export const UnsupportedPaymentType = new Error('Unsupported Payment Type');

const InvalidExpiryYearError = () => {
  return new AppError('invalid_expiry_year');
};

const StripeCard = Base.extend({
  tableName: 'stripe_cards',

  type() {
    return this.get('type');
  },

  lastFour() {
    return this.get('lastFour');
  },

  expMonth() {
    return this.get('expMonth');
  },

  expYear() {
    return this.get('expYear');
  },

  holderName() {
    return this.get('holderName');
  },

  user() {
    return this.belongsTo('User');
  },

  async addCard(token) {
    const id = this.get('id');
    const env = this.get('environment');

    let stripe;
    if (env === 'production') {
      stripe = stripeSvc.production;
    } else {
      stripe = stripeSvc.test;
    }

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
  create: async function({ user, token }) {
    const stripeCustomer = await user.stripeCustomer();

    let stripe;
    if (user.get('isTester')) {
      stripe = stripeSvc.test;
    } else {
      stripe = stripeSvc.production;
    }

    try {
      const paymentInfo = await stripe.customers.createSource(stripeCustomer, {
        source: token
      });

      await user.load(['stripeCard']);
      const currentCards = user.related('stripeCard');

      const newCard = await this
        .forge({
          id         : paymentInfo.id,
          userId     : user.get('id'),
          type       : paymentInfo.brand,
          lastFour   : paymentInfo.last4,
          expMonth   : paymentInfo.exp_month,
          expYear    : paymentInfo.exp_year,
          environment: user.get('isTester') ? 'test' : 'production'
        })
        .save(null, { method: 'insert' });

      if (currentCards.length) {
        await Promise.each(currentCards.toArray(), async (currentCard) => {
          try {
            await stripe.customers.deleteSource(stripeCustomer, currentCard.id);
            return currentCard.destroy();
          } catch (err) {
            console.error(err);
          }
        });
      }

      return newCard;
    } catch (err) {
      if (err instanceof stripe.errors.StripeCardError) {
        if (err.code === 'invalid_expiry_year') {
          throw InvalidExpiryYearError();
        }
      }

      throw err;
    }
  }
});

export default bookshelf.model('StripeCard', StripeCard);
