import ServiceCategory   from '../../models/service-category';
import { registerQuery } from '../registry';

const def = 'serviceCategory(categoryId: ID!): ServiceCategory';
const serviceCategory = (_, { categoryId: id }) => {
  return ServiceCategory.find(id);
};

registerQuery(def, { serviceCategory });
