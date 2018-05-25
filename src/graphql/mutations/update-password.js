import { combineResolvers } from 'graphql-resolvers';
import auth                 from '../middlewares/auth';
import { registerMutation } from '../registry';

const def = 'updatePassword(password: String!): Boolean';

const updatePassword = async (_, { password }, { user }) => {
  await user.updatePassword(password);
  return true;
};

registerMutation(def, {
  updatePassword: combineResolvers(auth, updatePassword)
});
