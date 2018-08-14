import { combineResolvers } from 'graphql-resolvers';
import auth                 from '../middlewares/auth';
import { registerMutation } from '../registry';
import ServiceCategory      from '../../models/service-category';
import Mission              from '../../models/mission';

const def = 'newMissionRequest(details: MissionDetails!): Boolean';

const newMissionRequest = async (_, { details }, { user }) => {
  const {
    categoryId,
    description,
    location,
    lat,
    lng,
    paymentMethod
  } = details;

  const serviceCategory = await ServiceCategory.find(categoryId);
  if (!serviceCategory) {
    return false;
  }

  const mission = await Mission.create({
    startDate: new Date(),
    currency: 'AED',
    price: 1000,
    client: user,
    serviceCategory,
    description,
    paymentMethod,
    lat,
    lng,
    location
  });

  mission.findProvider();

  return true;
};

registerMutation(def, {
  newMissionRequest: combineResolvers(auth, newMissionRequest)
});
