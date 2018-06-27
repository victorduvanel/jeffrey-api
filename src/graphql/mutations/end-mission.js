import { combineResolvers } from 'graphql-resolvers';
import auth                 from '../middlewares/auth';
import { registerMutation } from '../registry';
import Mission              from '../../models/mission';

const def = 'endMission(id: ID!): Mission';

export const endMission = async (_, { id }, { user }) => {
  const mission = await Mission.find(id);

  if (!mission) {
    throw new Error('Mission not found');
  }

  if (mission.get('status') !== 'accepted') {
    throw new Error('Mission is not accepted');
  }

  if (mission.get('providerId') !== user.get('id')) {
    throw new Error('Unauthorized');
  }

  await mission.end();

  return mission;
};

registerMutation(def, {
  endMission: combineResolvers(auth, endMission)
});
