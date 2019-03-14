import bodyParser from 'body-parser';
import stripe     from '../../services/stripe';
import config     from '../../config';

export const post = [
  bodyParser.raw({type: '*/*'}),

  async (req, res) => {
    const stripeSignature = req.headers['stripe-signature'];

    try {
      const event = stripe.webhooks.constructEvent(req.body, stripeSignature, config.stripe.webhookSecret);
      console.log('stripe', { event });
    } catch (err) {
      console.error(err);
    }

    res.send({
      success: true
    });
  }
];
