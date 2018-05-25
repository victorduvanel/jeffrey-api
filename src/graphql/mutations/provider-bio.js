import { combineResolvers } from 'graphql-resolvers';
import { registerMutation } from '../registry';
import auth                 from '../middlewares/auth';

const def = 'providerBio(bio: String!): Boolean';

const providerBio = async (_, { bio }, { user }) => {
  user.set('bio', bio);
  await user.save();
  return true;
};

registerMutation(def, {
  providerBio: combineResolvers(auth, providerBio)
});
