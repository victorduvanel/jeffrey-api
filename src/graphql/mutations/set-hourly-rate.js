import { combineResolvers } from 'graphql-resolvers';
import ProviderPrice        from '../../models/provider-price';
import ServiceCategory      from '../../models/service-category';
import { registerMutation } from '../registry';
import auth                 from '../middlewares/auth';

const def = 'setHourlyRate(serviceCategoryId: ID!, hourlyRate: Int!): Boolean';

const setHourlyRate = async (_, { serviceCategoryId, hourlyRate }, { user }) => {
  const serviceCategory = await ServiceCategory.find(serviceCategoryId);
  if (!serviceCategory) {
    return false;
  }

  await ProviderPrice
    .create({
      user,
      serviceCategory,
      price: hourlyRate
    });

  return true;
};

registerMutation(def, {
  setHourlyRate: combineResolvers(auth, setHourlyRate)
});
