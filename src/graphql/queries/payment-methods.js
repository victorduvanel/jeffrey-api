import Promise              from 'bluebird';
import { combineResolvers } from 'graphql-resolvers';
import auth                 from '../middlewares/auth';
import { registerQuery }    from '../registry';

const def = 'paymentMethods: [PaymentMethod]';
const paymentMethods = async (_, __, { user }) => {
  await Promise.delay(10000);
  return [];
};

registerQuery(def, {
  paymentMethods: combineResolvers(auth, paymentMethods)
});
