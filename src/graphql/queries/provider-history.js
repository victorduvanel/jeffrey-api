import { combineResolvers } from 'graphql-resolvers';
import Mission              from '../../models/mission';
import auth                 from '../middlewares/auth';
import { registerQuery }    from '../registry';

const def = 'providerHistory: [User]';

const providerHistory = async (_, __, { user }) => {
  const providers = await Mission.providerHistory(user);
  return providers.toArray().map(user => user.serialize());
};

registerQuery(def, {
  providerHistory: combineResolvers(auth, providerHistory)
});
