import { registerType } from '../registry';
import ProviderPrice    from '../../models/provider-price';
import ServiceCategory  from '../../models/service-category';

const def = `
type ServiceCategory {
  id: ID!
  slug: String!
  color: String
  subCategories: [ServiceCategory]
  providerPrice: Int
  providerPriceCurrency: Currency
}
`;

const resolver = {
  ServiceCategory: {
    subCategories: async ({ id }, params, { user }) => {
      const categories = await ServiceCategory
        .query((qb) => {
          qb.where('parent_id', '=', id);
          qb.orderBy('ordinal_position');
        })
        .fetchAll();

      const categoryIds = categories.map(category => category.get('id'));
      const currentUserPrices = {};

      if (user && user.get('isProvider')) {
        const prices = await ProviderPrice
          .query((qb) => {
            qb.where('user_id', user.get('id'));
            qb.whereIn('service_category_id', categoryIds);
          })
          .fetchAll();

        prices.forEach((price) => {
          currentUserPrices[price.get('serviceCategoryId')] = {
            price: price.get('price'),
            currency: price.get('currency')
          };
        });
      }

      const categoryMapper = (category) => {
        const attr = category.serialize();
        attr.subCategories = categories
          .filter(subCat => subCat.get('parentId') === category.get('id'))
          .map(categoryMapper);

        if (currentUserPrices[attr.id]) {
          attr.providerPrice = currentUserPrices[attr.id].price;
          attr.providerPriceCurrency = currentUserPrices[attr.id].currency;
        } else {
          attr.providerPrice = null;
          attr.providerPriceCurrency = null;
        }
        return attr;
      };

      return categories.map(categoryMapper);
    }
  }
};

registerType(def, resolver);
