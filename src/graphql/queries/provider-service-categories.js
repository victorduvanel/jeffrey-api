import ServiceCategory   from '../../models/service-category';
import ProviderPrice     from '../../models/provider-price';
import { registerQuery } from '../registry';

const def = 'providerServiceCategories: [ServiceCategory]';

const providerServiceCategories = async (_, __, { user }) => {
  const country = await user.country();

  const categories = await ServiceCategory
    .query((qb) => {
      qb.orderBy('ordinal_position');
      qb.leftJoin('countries', 'countries.id', 'service_categories.country_id');
      qb.where('countries.code', country.get('code'));
    })
    .fetchAll();

  const categoryIds = categories.map(category => category.get('id'));

  if (user && user.get('isProvider')) {
    if (!user.providerPricesCache) {
      user.providerPricesCache = {};
    }

    const prices = await ProviderPrice
      .query((qb) => {
        qb.where('user_id', user.get('id'));
        qb.whereIn('service_category_id', categoryIds);
      })
      .fetchAll();

    prices.forEach((price) => {
      user.providerPricesCache[price.get('serviceCategoryId')] = {
        amount: price.get('price'),
        currency: price.get('currency')
      };
    });
  }

  categories.forEach(category => category._subcategories = categories.filter(subCat => subCat.get('parentId') === category.get('id')));

  const rootCategories = categories.filter(category => category.get('parentId') === null);
  return rootCategories;
};

registerQuery(def, { providerServiceCategories });
