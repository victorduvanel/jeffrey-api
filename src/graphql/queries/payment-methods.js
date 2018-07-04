import { combineResolvers } from 'graphql-resolvers';
import auth                 from '../middlewares/auth';
import { registerQuery }    from '../registry';

const def = 'paymentMethods: [PaymentMethod]';
const paymentMethods = async (_, __, { user }) => {
  await user.load(['stripeCard']);
  const cards = user.related('stripeCard');
  return cards.toArray();
};

registerQuery(def, {
  paymentMethods: combineResolvers(auth, paymentMethods)
});
