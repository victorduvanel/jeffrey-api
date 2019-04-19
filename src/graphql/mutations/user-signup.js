import { combineResolvers } from 'graphql-resolvers';
import auth                 from '../middlewares/auth';
import { registerMutation } from '../registry';
import config               from '../../config';

const def = 'userSignup(firstName: String!, lastName: String!): Boolean';

const userSignup = async (_, { firstName, lastName }, { user }) => {
  user.set('firstName', firstName);
  user.set('lastName', lastName);

  await user.save();
  return true;
};

registerMutation(def, {
  userSignup: combineResolvers(auth, userSignup)
});
