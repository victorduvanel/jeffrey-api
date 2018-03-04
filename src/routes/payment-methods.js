import oauth2         from '../middlewares/oauth2';
import StripeCustomer from '../models/stripe-customer';
import bodyParser     from 'body-parser';

export const get = [
  oauth2,

  async (req, res) => {
    const user = await req.user.load('stripeCustomer');
    let stripeCustomer = user.related('stripeCustomer');

    if (stripeCustomer.length) {
      stripeCustomer = stripeCustomer.at(0);

      res.send({
        'payment-method': {
          type          : stripeCustomer.get('type'),
          'last-four'   : stripeCustomer.get('lastFour'),
          'exp-month'   : stripeCustomer.get('expMonth'),
          'exp-year'    : stripeCustomer.get('expYear'),
          'holder-name' : stripeCustomer.get('holderName')
        }
      });
    } else {
      res.send({
        'payment-method': null
      });
    }
  }
];

export const post = [
  oauth2,
  bodyParser.urlencoded({ extended: false }),

  async (req, res) => {
    const stripeToken = req.body.stripe_token;

    const user = await req.user.load('stripeCustomer');
    let stripeCustomer = user.related('stripeCustomer');

    if (stripeCustomer.length) {
      stripeCustomer = stripeCustomer.at(0);
      await stripeCustomer.addCard(stripeToken);
    } else {
      stripeCustomer = await StripeCustomer.create({
        user,
        token: stripeToken
      });
    }

    res.send({
      success: true
    });
  }
];
