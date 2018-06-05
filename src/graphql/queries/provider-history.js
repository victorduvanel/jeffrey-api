import Promise              from 'bluebird';
import { combineResolvers } from 'graphql-resolvers';
import Mission              from '../../models/mission';
import auth                 from '../middlewares/auth';
import { registerQuery }    from '../registry';

const def = 'providerHistory: [User]';

const providerHistory = async (_, __, { user }) => {
  if(!user){
    return []
  }
  
  const clients = await Mission.providerHistory(user);
  return Promise.all(clients.toArray().map(user => user.serialize()));
};

registerQuery(def, {
  providerHistory
});
