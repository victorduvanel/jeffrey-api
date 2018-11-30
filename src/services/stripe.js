import stripe from 'stripe';
import config from '../config';

const production = stripe(config.stripe.production.secretKey);
production.setApiVersion('2018-05-21');

const test = stripe(config.stripe.test.secretKey);
test.setApiVersion('2018-05-21');


export default {
  test,

  get production() {
    if (!config.PRODUCTION) {
      throw new Error('Do not use production version of stripe in non production environment');
    }
    return production;
  }
};
