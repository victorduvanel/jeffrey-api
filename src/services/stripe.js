import stripe from 'stripe';
import config from '../config';

const s = stripe(config.stripe.secretKey);
s.setApiVersion('2018-05-21');

export default s;
