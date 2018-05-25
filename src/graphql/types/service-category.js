import { registerType } from '../registry';
import ServiceCategory  from '../../models/service-category';

const def = `
type ServiceCategory {
  id: ID!
  slug: String!
  color: String
  subCategories: [ServiceCategory]
}
`;

const resolver = {
  ServiceCategory: {
    subCategories: async ({ id }) => {
      const categories = await ServiceCategory
        .query((qb) => {
          qb.where('parent_id', '=', id);
          qb.orderBy('ordinal_position');
        })
        .fetchAll();

      return categories.toArray().map(category => category.serialize());
    }
  }
};

registerType(def, resolver);
