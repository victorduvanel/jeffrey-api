import moment      from 'moment';
import bodyParser  from 'body-parser';
import oauth2      from '../middlewares/oauth2';
import stripe      from '../services/stripe';
import User        from '../models/user';
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

export const post__ = [
  bodyParser.json(),

  async (req, res) => {
    const user = await User.find('3c656ce5-1e21-4332-a268-d7599f2f0e40');
    const dateOfBirth = user.get('dateOfBirth');

    await user.load(['business', 'postalAddress']);

    const postalAddress = user.related('postalAddress');
    const business = user.related('business');
    let businessAddress = null;

    if (business) {
      await business.load(['postalAddress']);
      businessAddress = business.related('postalAddress');
    }

    const tosAcceptance = await user.tosAcceptance();
    const idProof = await user.idProof();

    const stripeAccount = await user.stripeAccount();
    console.log(stripeAccount);

    const payload = {
      business_name: business && business.get('name'),
      legal_entity: {
        first_name: user.get('firstName'),
        last_name: user.get('lastName'),

        dob: (dateOfBirth && {
          day: moment(dateOfBirth).format('DD'),
          month: moment(dateOfBirth).format('MM'),
          year: moment(dateOfBirth).format('YYYY'),
        }),


        personal_address: (postalAddress && {
          city: postalAddress.get('city'),
          country: postalAddress.get('country'),
          line1: postalAddress.get('line1'),
          line2: postalAddress.get('line2'),
          postal_code: postalAddress.get('postalCode'),
          state: postalAddress.get('state')
        }),

        type: business && business.get('type'),
        business_tax_id: business && business.get('taxId'),

        address: businessAddress && {
          city: businessAddress.get('city'),
          country: businessAddress.get('country'),
          line1: businessAddress.get('line1'),
          line2: businessAddress.get('line2'),
          postal_code: businessAddress.get('postalCode'),
          state: businessAddress.get('state')
        },

        //verification: {
        //document: 'file_1CA7VPHACbPneI06ynGKK0WX', // file.id
        //}
      },

      tos_acceptance: tosAcceptance && {
        ip: tosAcceptance.get('ip'),
        user_agent: tosAcceptance.get('userAgent'),
        date: parseInt(moment(tosAcceptance.get('createdAt')).format('X'), 10)
      },

      external_account: {
        account_holder_name: 'William Riancho',
        account_holder_type: 'individual',
        object: 'bank_account',
        account_number: 'FR89370400440532013000',
        country: 'FR',
        currency: 'EUR',
      }
    };

    res.send(payload);

    return;

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
