import Promise              from 'bluebird';
import { combineResolvers } from 'graphql-resolvers';
import Mission              from '../../models/mission';
import auth                 from '../middlewares/auth';
import { registerQuery }    from '../registry';

const def = 'clientHistory2: [User]';

const clientHistory2 = async (_, __, { user }) => {
  const providers = await Mission.clientHistory2(user);
  return Promise.all(providers.toArray().map(user => user.serialize()));
};

registerQuery(def, {
  clientHistory2: combineResolvers(auth, clientHistory2)
});
