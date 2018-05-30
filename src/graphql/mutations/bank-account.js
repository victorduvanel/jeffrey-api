import { combineResolvers } from 'graphql-resolvers';
import stripe               from '../../services/stripe';
import auth                 from '../middlewares/auth';
import { registerMutation } from '../registry';

const def = 'bankAccount(details: BankAccountDetails): Boolean';

const bankAccount = async (_, { details }, { user }) => {
  if (!user) {
    return false;
  }

  const stripeAccount = await user.stripeAccount();
  await stripe.accounts.update(stripeAccount.get('id'), {
    external_account: {
      account_holder_name: details.holderName,
      account_holder_type: details.type,
      object: 'bank_account',
      account_number: details.iban,
      country: user.get('country'),
      currency: 'EUR'
    }
  });

  stripeAccount.set('hasExternalAccount', true);
  await stripeAccount.save();
  return true;
};

registerMutation(def, {
  bankAccount: combineResolvers(auth, bankAccount)
});