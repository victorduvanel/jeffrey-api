import bodyParser  from 'body-parser';
import braintree   from '../services/braintree';
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

    if (body.type === 'PayPalAccount') {
      await user.braintreeCustomer();

      const result = await braintree.paymentMethod.create({
        customerId: user.get('id'),
        paymentMethodNonce: body.nonce
      });

      // ########### TO CHARGE ###########
      //
      // gateway.transaction.sale({
      //   amount: '10.00',
      //   customerId: 'customer_123',
      // })
      //   .then(...);

      if (result.success) {
        console.log(result.paymentMethod.email);
      } else {
        res.send({
          success: false
        });
        return;
      }
    } else {
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
    }

    res.send({
      success: true
    });
  }
];
