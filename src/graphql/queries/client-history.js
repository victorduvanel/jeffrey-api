import { combineResolvers } from 'graphql-resolvers';
import Mission              from '../../models/mission';
import auth                 from '../middlewares/auth';
import { registerQuery }    from '../registry';

const def = `
clientHistory(
  providerId: ID!
): [Mission]
`;

const clientHistory = async (_, { providerId }, { user }) => {
  const missions = await Mission.clientHistory({user, providerId });
  return missions.toArray().map(mission => mission.serialize());
};

registerQuery(def, {
  clientHistory: combineResolvers(auth, clientHistory)
});
