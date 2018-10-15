import { combineResolvers } from 'graphql-resolvers';
import { GraphQLError }     from 'graphql';
import auth                 from '../middlewares/auth';
import { registerMutation } from '../registry';
import Mission              from '../../models/mission';

const def = `
  missionStatus(
    id: ID!,
    status: MissionStatus!,
    lat: Float
    lng: Float
    location: String
  ): Mission`;

export const missionStatus = async (_, { id, status, lat, lng, location }, { user }) => {
  const mission = await Mission.find(id);

  if (!mission) {
    throw new GraphQLError('Mission not found');
  }

  await mission.setStatus(status, user);

  if (status === 'accepted') {
    mission.set({
      lat,
      lng,
      location
    });
    await mission.save();
  }

  return mission;
};

registerMutation(def, {
  missionStatus: combineResolvers(auth, missionStatus)
});
