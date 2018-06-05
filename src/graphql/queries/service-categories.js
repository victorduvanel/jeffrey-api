import ServiceCategory   from '../../models/service-category';
import ProviderPrice     from '../../models/provider-price';
import { registerQuery } from '../registry';

const def = 'serviceCategories: [ServiceCategory]';

const serviceCategories = async (_, __, { user }) => {
  const categories = await ServiceCategory
    .query((qb) => {
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

  const rootCategories = categories.filter(category => category.get('parentId') === null);

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

  return rootCategories.map(categoryMapper);
};

registerQuery(def, { serviceCategories });
