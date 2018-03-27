import fs             from 'fs';
import bodyParser     from 'body-parser';
import oauth2         from '../middlewares/oauth2';
import StripeCustomer from '../models/stripe-customer';

import stripe         from '../services/stripe';

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

export const post__ = [
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

export const post = [
  bodyParser.json(),

  async (req, res) => {
    try {


      //const file = await stripe.fileUploads.create(
        //{
          //purpose: 'identity_document',
          //file: {
            //data: fs.readFileSync('/Users/tukula/Downloads/passport-medium.jpg'),
            //name: 'passport-medium.jpg'
          //}
        //},
        //{stripe_account: 'acct_1CA7HnHACbPneI06' }
      //);
      //console.log(file);

      // const r = await stripe.accounts.create({
      const r = await stripe.accounts.update('acct_1CA7HnHACbPneI06', {
        // country: 'FR',
        // type: 'custom',
        // external_account: 'acct_1CA7H3ADUlTqU2mE',

        metadata: {
          internal_id: '744e54fb-7d7b-454c-a6e8-86e9ffe67566',
        },


        business_name: 'William Riancho',
        legal_entity: {
          first_name: 'William',
          last_name: 'Riancho',
          type: 'individual',
          business_tax_id: '532772563',
          address: {
            city: 'Denain',
            country: 'FR',
            line1: '57 Impasse Moura',
            postal_code: '59220',
            state: 'Hauts-de-France',
          },
          personal_address: {
            city: 'Denain',
            country: 'FR',
            line1: '57 Impasse Moura',
            postal_code: '59220',
            state: 'Hauts-de-France',
          },
          dob: {
            day: '08',
            month: '12',
            year: '1992'
          },
          //verification: {
            //document: 'file_1CA7VPHACbPneI06ynGKK0WX', // file.id
          //}
        },
        tos_acceptance: {
          date: 1522116301,
          ip: '139.47.28.105'
        },
        external_account: {
          account_holder_name: 'William Riancho',
          account_holder_type: 'individual',
          object: 'bank_account',
          account_number: 'FR89370400440532013000',
          country: 'FR',
          currency: 'EUR',
        }
      });

      console.log(r);
    } catch (err) {
      console.error(err);
    }
    res.send('ok');
  }
];
