import { combineResolvers } from 'graphql-resolvers';
import auth                 from '../middlewares/auth';
import { registerMutation } from '../registry';
import User                 from '../../models/user';
import ServiceCategory      from '../../models/service-category';
import Mission              from '../../models/mission';

const def = 'newMission(startDate: String!, price: Int!, clientId: ID!, serviceCategoryId: ID!): Boolean';

const newMission = async (_, { startDate, clientId, price, serviceCategoryId }, { user }) => {
  const client = await User.find(clientId);
  if (!client) {
    return false;
  }

  const serviceCategory = await ServiceCategory.find(serviceCategoryId);
  if (!ServiceCategory) {
    return false;
  }

  await Mission.create({
    startDate,
    price,
    currency: 'EUR',
    status: 'pending',
    provider: user,
    client,
    serviceCategory
  });

  return true;
};

registerMutation(def, {
  newMission: combineResolvers(auth, newMission)
});
