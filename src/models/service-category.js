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
        console.log('serviceCategories');
        const categories = await ServiceCategory.fetchAll();

        const rt = categories.map(category => ({
          id: category.get('id'),
          name: category.get('name')
        }));

        console.log(rt);
        return rt;
      }
    }
  }
});

export default bookshelf.model('ServiceCategory', ServiceCategory);
