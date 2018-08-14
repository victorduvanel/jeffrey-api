import Promise              from 'bluebird';
import { combineResolvers } from 'graphql-resolvers';
import ProviderPrice        from '../../models/provider-price';
import ServiceCategory      from '../../models/service-category';
import { registerMutation } from '../registry';
import auth                 from '../middlewares/auth';

const def = 'setHourlyRate(serviceCategoryId: ID!, price: Int!, currency: String!): Boolean';

const setHourlyRate = async (_, { serviceCategoryId, price, currency }, { user }) => {
  const serviceCategory = await ServiceCategory.find(serviceCategoryId);
  if (!serviceCategory) {
    return false;
  }

  const subCategories = (await serviceCategory.subCategories()).toArray();

  await Promise.map([serviceCategory, ...subCategories], (serviceCategory) => ProviderPrice
    .create({
      user,
      serviceCategory,
      price,
      currency
    })
  );

  return true;
};

registerMutation(def, {
  setHourlyRate: combineResolvers(auth, setHourlyRate)
});
