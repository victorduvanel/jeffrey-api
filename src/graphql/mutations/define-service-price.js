import Promise              from 'bluebird';
import _                    from 'lodash';
import { combineResolvers } from 'graphql-resolvers';
import ProviderPrice        from '../../models/provider-price';
import ServiceCategory      from '../../models/service-category';
import { registerMutation } from '../registry';
import auth                 from '../middlewares/auth';

const def = 'defineServicePrice(serviceCategoryId: ID!, price: Int, currency: String, isEnabled: Boolean): Boolean';

const defineServicePrice = async (__, { serviceCategoryId, ...props }, { user }) => {
  const serviceCategory = await ServiceCategory.find(serviceCategoryId);
  if (!serviceCategory) {
    return false;
  }

  const subCategories = (await serviceCategory.subCategories()).toArray();
  const { price, currency, isEnabled } = props;

  await Promise.map([serviceCategory, ...subCategories], async (serviceCategory) => {
    const prices = await ProviderPrice
      .query((qb) => {
        qb.where('user_id', user.get('id'));
        qb.where('service_category_id', serviceCategoryId);
        qb.limit(1);
      })
      .fetchAll();

    if (prices.length) {
      ['price', 'currency', 'isEnabled'].forEach((propertyName) => {
        if (!_.isNil(props[propertyName])) {
          prices.models[0].set(propertyName, props[propertyName]);
        }
      });
      return prices.models[0].save();
    } else if (serviceCategory && price && currency && !_.isNil(isEnabled)) {
      await ProviderPrice
        .create({
          user,
          serviceCategory,
          price,
          currency,
          isEnabled
        });
    }
  });

  return true;
};

registerMutation(def, {
  defineServicePrice: combineResolvers(auth, defineServicePrice)
});
