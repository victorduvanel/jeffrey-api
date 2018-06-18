import { combineResolvers } from 'graphql-resolvers';
import StripeCard           from '../../models/stripe-card';
import auth                 from '../middlewares/auth';
import { registerMutation } from '../registry';

const def = 'paymentMethod(details: PaymentMethodDetails!): Boolean';

const paymentMethod = async (_, { details }, { user }) => {
  const {
    cardHolderName,
    cardNumber,
    cardExpiryMonth,
    cardExpiryYear,
    cvv
  } = details;

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

  return true;
};

registerMutation(def, {
  paymentMethod: combineResolvers(auth, paymentMethod)
});
