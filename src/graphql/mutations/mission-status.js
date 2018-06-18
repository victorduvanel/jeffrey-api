import { combineResolvers } from 'graphql-resolvers';
import { GraphQLError }     from 'graphql';
import auth                 from '../middlewares/auth';
import { registerMutation } from '../registry';
import Mission              from '../../models/mission';

const def = 'missionStatus(id: ID!, status: MissionStatus!): Mission';

export const missionStatus = async (_, { id, status }, { user }) => {
  const mission = await Mission.find(id);

  if (!mission) {
    throw new GraphQLError('Mission not found');
  }

  await mission.setStatus(status, user);

  return mission;
};

registerMutation(def, {
  missionStatus: combineResolvers(auth, missionStatus)
});
