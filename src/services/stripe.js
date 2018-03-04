import stripe from 'stripe';
import config  from '../config';

export default stripe(config.stripe.secretKey);
