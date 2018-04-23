import bodyParser from 'body-parser';
import stripe     from '../../services/stripe';
import logger     from '../../services/logger';
import config     from '../../config';

export const post = [
  bodyParser.raw({type: '*/*'}),

  async (req, res) => {
    const stripeSignature = req.headers['stripe-signature'];

    try {
      const event = stripe.webhooks.constructEvent(req.body, stripeSignature, config.stripe.webhookSecret);
      logger.info('stripe', { event });
    } catch (err) {
      logger.error(err);
    }

    res.send({
      success: true
    });
  }
];
