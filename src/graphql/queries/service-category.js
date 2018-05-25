import ServiceCategory   from '../../models/service-category';
import { registerQuery } from '../registry';

const def = 'serviceCategory(categoryId: String!): ServiceCategory';
const serviceCategory = async (_, { categoryId: id }) => {
  const category = await ServiceCategory.find(id);
  return category.serialize();
};

registerQuery(def, { serviceCategory });
