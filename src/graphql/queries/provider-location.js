import { combineResolvers } from 'graphql-resolvers';
import auth                 from '../middlewares/auth';
import Mission              from '../../models/mission';
import User                 from '../../models/user';
import { registerQuery }    from '../registry';

const def = 'providerLocation(missionId: ID!): Location';

const providerLocation = async (_, { missionId }, { user }) => {
  const mission = await Mission.find(missionId);

  if (!mission) {
    throw new Error('Mission not found');
  }

  if (mission.get('status') !== 'started') {
    throw new Error('Mission should be started');
  }

  if (user.get('id') !== mission.get('clientId')) {
    throw new Error('Only the client can access provider location');
  }

  const provider = await User.find(mission.get('providerId'));

  const lat = provider.get('lat');
  const lng = provider.get('lng');

  mission.set('lat', lat);
  mission.set('lng', lng);
  await mission.save();

  return {
    lat,
    lng
  };
};

registerQuery(def, {
  providerLocation: combineResolvers(auth, providerLocation)
});
