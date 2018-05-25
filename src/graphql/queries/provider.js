import { combineResolvers } from 'graphql-resolvers';
import auth                 from '../middlewares/auth';
import { registerQuery }    from '../registry';
import User                 from '../../models/user';

const def = 'provider(providerId: ID!): User';
const provider = async (_, __, ___, { variableValues: { providerId } }) => {
  const user = await User.find(providerId);
  if (!user) {
    return null;
  }
  return user.serialize();
};

registerQuery(def, {
  provider: combineResolvers(auth, provider)
});
