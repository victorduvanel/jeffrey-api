import { combineResolvers } from 'graphql-resolvers';
import auth                 from '../middlewares/auth';
import { registerMutation } from '../registry';
import Mission              from '../../models/mission';

const def = 'missionStatus(id: ID!, status: MissionStatus!): Mission';

const missionStatus = async (_, { id, status }, { user }) => {
  const mission = await Mission.find(id);
  if (!mission) {
    throw new Error('mission not found');
  }

  switch (status) {
    case 'accepted':
    case 'refused':
      if (mission.get('clientId') !== user.get('id')) {
        throw new Error('Unauthorized');
      }
      break;

    case 'canceled':
      if (mission.get('providerId') !== user.get('id')) {
        throw new Error('Unauthorized');
      }
      break;

    default:
      throw new Error('invalid status');
  }

  mission.set('status', status);
  await mission.save();

  return mission.serialize();
};

registerMutation(def, {
  missionStatus: combineResolvers(auth, missionStatus)
});