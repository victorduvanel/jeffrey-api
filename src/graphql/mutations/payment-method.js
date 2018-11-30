import { combineResolvers } from 'graphql-resolvers';
import StripeCard           from '../../models/stripe-card';
import auth                 from '../middlewares/auth';
import { registerMutation } from '../registry';

const def = 'paymentMethod(token: String!): Boolean';

const paymentMethod = async (_, { token }, { user }) => {
  await StripeCard.create({
    user,
    token
  });

  return true;
};

registerMutation(def, {
  paymentMethod: combineResolvers(auth, paymentMethod)
});
