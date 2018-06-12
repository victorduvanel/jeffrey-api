import { combineResolvers } from 'graphql-resolvers';
import auth                 from '../middlewares/auth';
import { registerMutation } from '../registry';

const def = 'currentLocation(lat: Float!, lng: Float!): Boolean';

const currentLocation = async (_, { lat, lng }, { user }) => {
  user.set('lat', lat);
  user.set('lng', lng);
  await user.save();
  return true;
};

registerMutation(def, {
  currentLocation: combineResolvers(auth, currentLocation)
});
