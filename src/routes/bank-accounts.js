import oauth2     from '../middlewares/oauth2';
import stripe     from '../services/stripe';
import bodyParser from 'body-parser';

export const post = [
  oauth2,
  bodyParser.json(),

  async (req, res) => {
    const user = req.user;

    const { body } = req;
    const stripeAccount = await user.stripeAccount();

    await stripe.accounts.update(stripeAccount.get('id'), {
      external_account: {
        account_holder_name: body['holder-name'],
        account_holder_type: body['holder-type'],
        object: 'bank_account',
        account_number: body['account-number'],
        country: user.get('country'),
        currency: 'EUR'
      }
    });

    stripeAccount.set('hasExternalAccount', true);
    await stripeAccount.save();

    res.send({ success: true });
  }
];
