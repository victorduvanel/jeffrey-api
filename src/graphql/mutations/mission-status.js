import { combineResolvers } from 'graphql-resolvers';
import { GraphQLError }     from 'graphql';
import auth                 from '../middlewares/auth';
import { registerMutation } from '../registry';
import Mission              from '../../models/mission';

const def = `
  missionStatus(
    id: ID!,
    status: MissionStatus!,
    lat: Float,
    lng: Float,
    location: String,
    country: String
  ): Mission`;

export const missionStatus = async (_, { id, status, lat, lng, location, country }, { user }) => {
  const mission = await Mission.find(id);

  if (!mission) {
    throw new GraphQLError('Mission not found');
  }

  if (status === 'started') {
    mission.set({
      providerLat: lat,
      providerLng: lng
    });
  } else if (status === 'accepted') {
    await mission.load(['provider']);

    const provider = mission.related('provider');
    const providerCountry = await provider.country();

    if (!providerCountry) {
      throw new Error('Invalid provider country');
    }

    if (providerCountry.get('code') !== country) {
      throw new Error('Invalid country');
    }

    mission.set({
      lat,
      lng,
      location
    });

    await mission.save();
  }

  await mission.setStatus(status, user);

  return mission;
};

registerMutation(def, {
  missionStatus: combineResolvers(auth, missionStatus)
});
