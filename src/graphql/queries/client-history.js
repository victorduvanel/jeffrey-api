import { combineResolvers } from 'graphql-resolvers';
import Mission              from '../../models/mission';
import auth                 from '../middlewares/auth';
import { registerQuery }    from '../registry';

const def = 'clientHistory: [User]';

const clientHistory = async (_, __, { user }) => {
  if (!user) {
    return null;
  }

  const providers = await Mission.clientHistory(user);
  return providers.toArray().map(user => user.serialize());
};

registerQuery(def, {
  clientHistory: combineResolvers(auth, clientHistory)
});
