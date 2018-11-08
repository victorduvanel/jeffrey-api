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
    serviceCategoryId: ID!
  ): String`;

const newMission = async (_, { startDate, clientId, price, serviceCategoryId }, { user }) => {

  const client = await User.find(clientId);
  if (!client) {
    throw new Error('Client unknown');
  }

  const serviceCategory = await ServiceCategory.find(serviceCategoryId);
  if (!ServiceCategory) {
    throw new Error('Service not supported');
  }

  const country = await user.country();
  if (!country) {
    throw new Error('Country not supported');
  }

  const mission = await Mission.create({
    startDate: new Date(startDate),
    price,
    currency: country.currency(),
    provider: user,
    client,
    serviceCategory
  });

  return mission.get('id');
};

registerMutation(def, {
  newMission: combineResolvers(auth, newMission)
});
