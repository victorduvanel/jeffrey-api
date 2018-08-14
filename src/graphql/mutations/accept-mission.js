import { combineResolvers } from 'graphql-resolvers';
import { GraphQLError }     from 'graphql';
import auth                 from '../middlewares/auth';
import { registerMutation } from '../registry';
import Mission              from '../../models/mission';

const def = 'acceptMission(id: ID!): Boolean';

export const acceptMission = async (_, { id }, { user }) => {
  const mission = await Mission.find(id);

  if (!mission) {
    throw new GraphQLError('Mission not found');
  }

  return mission.setProvider(user);
};

registerMutation(def, {
  acceptMission: combineResolvers(auth, acceptMission)
});
