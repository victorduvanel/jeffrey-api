import bodyParser  from 'body-parser';
import oauth2      from '../middlewares/oauth2';
import StripeCard  from '../models/stripe-card';

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
  bodyParser.json(),

  async (req, res) => {
    const { user, body } = req;

    const cardHolderName = body['card-holder-name'];
    const cardNumber = body['card-number'];
    const cardExpiryMonth = body['card-expiry-month'];
    const cardExpiryYear = body['card-expiry-year'];
    const cvv = body.cvv;

    await StripeCard.create({
      user,
      card: {
        number: cardNumber,
        expMonth: cardExpiryMonth,
        expYear: cardExpiryYear,
        cvc: cvv,
        holderName: cardHolderName
      }
    });

    res.send({
      success: true
    });
  }
];
