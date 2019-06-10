import { combineResolvers } from 'graphql-resolvers';
import ProviderPrice        from '../../models/provider-price';
import ServiceCategory      from '../../models/service-category';
import { registerMutation } from '../registry';
import auth                 from '../middlewares/auth';

const def = 'defineServicePrice(serviceCategoryId: ID!, isEnabled: Boolean!): ServiceCategory';

const defineServicePrice = async (__, { serviceCategoryId, isEnabled }, { user }) => {
  const serviceCategory = await ServiceCategory.find(serviceCategoryId);
  if (!serviceCategory) {
    throw new Error('Service category not found');
  }

  await ProviderPrice
    .create({
      user,
      serviceCategory,
      isEnabled
    });

  return ServiceCategory.find(serviceCategoryId);
};

registerMutation(def, {
  defineServicePrice: combineResolvers(auth, defineServicePrice)
});
