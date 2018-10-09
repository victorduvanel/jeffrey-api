import { combineResolvers } from 'graphql-resolvers';
import auth                 from '../middlewares/auth';
import { registerMutation } from '../registry';
import User                 from '../../models/user';
import ServiceCategory      from '../../models/service-category';
import Mission              from '../../models/mission';

const def = `
  newMission(
    startDate: String!,
    price: Int!,
    clientId: ID!,
    serviceCategoryId: ID!,
    currentLocation: LocationInput!
  ): Boolean`;

const newMission = async (_, { startDate, clientId, price, serviceCategoryId, currentLocation }, { user }) => {

  const client = await User.find(clientId);
  if (!client) {
    return false;
  }

  const serviceCategory = await ServiceCategory.find(serviceCategoryId);
  if (!ServiceCategory) {
    return false;
  }

  const country = await user.country();
  if (!country) {
    throw new Error('Country not supported');
  }

  await Mission.create({
    startDate: new Date(startDate),
    price,
    currency: country.currency(),
    provider: user,
    client,
    serviceCategory,
    lat: currentLocation.lat,
    lng: currentLocation.lng,
    location: currentLocation.description
  });

  return true;
};

registerMutation(def, {
  newMission: combineResolvers(auth, newMission)
});
