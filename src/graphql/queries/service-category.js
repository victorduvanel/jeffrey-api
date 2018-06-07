import ServiceCategory   from '../../models/service-category';
import { registerQuery } from '../registry';

const def = 'serviceCategory(categoryId: String!): ServiceCategory';
const serviceCategory = (_, { categoryId: id }) => {
  return ServiceCategory.find(id);
};

registerQuery(def, { serviceCategory });
