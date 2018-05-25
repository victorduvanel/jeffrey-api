import { combineResolvers } from 'graphql-resolvers';
import Mission              from '../../models/mission';
import auth                 from '../middlewares/auth';
import { registerQuery }    from '../registry';

const def = `
clientHistory(
  providerId: ID!,
  serviceCategoryId: ID!
): [Mission]
`;

const clientHistory = async (_, { providerId, serviceCategoryId }, { user }) => {
  const missions = await Mission.clientHistory({user, providerId, serviceCategoryId});
  return missions.toArray().map(mission => mission.serialize());
};

registerQuery(def, {
  clientHistory: combineResolvers(auth, clientHistory)
});
