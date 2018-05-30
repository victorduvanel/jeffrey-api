import ServiceCategory   from '../../models/service-category';
import { registerQuery } from '../registry';

const def = 'serviceCategories: [ServiceCategory]';

const serviceCategories = async () => {
  const categories = await ServiceCategory
    .query((qb) => {
      qb.orderBy('ordinal_position');
    })
    .fetchAll();
  const rootCategories = categories.filter(category => category.get('parentId') === null);

  const categoryMapper = (category) => {
    const attr = category.serialize();

    attr.subCategories = categories
      .filter(subCat => subCat.get('parentId') === category.get('id'))
      .map(categoryMapper);
    return attr;
  };
  return rootCategories.map(categoryMapper);
};

registerQuery(def, { serviceCategories });
