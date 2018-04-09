import bookshelf           from '../services/bookshelf';
import Base                from './base';

const ServiceCategory = Base.extend({
  tableName: 'service_categories',
}, {
  graphqlDef: function() {
    return `
      type ServiceCategory {
        id: String!
        name: String!
      }
    `;
  },

  resolver: {
    Query: {
      serviceCategories:  async function() {
        const categories = await ServiceCategory.fetchAll();

        return categories.map(category => ({
          id: category.get('id'),
          name: category.get('name')
        }));
      }
    }
  }
});

export default bookshelf.model('ServiceCategory', ServiceCategory);
