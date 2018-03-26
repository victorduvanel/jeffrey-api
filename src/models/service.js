import bookshelf           from '../services/bookshelf';
import Base                from './base';

const Service = Base.extend({
  tableName: 'services',
}, {
  graphqlDef: function() {
    return `
      type Service {
        id: String!
        name: String!
      }
    `;
  },

  resolver: {
    Query: {
      services:  async function() {
        const services = await this.fetchAll();

        return services.map(service => ({
          id: service.get('id'),
          name: service.get('name')
        }));
      }
    }
  }
});

export default bookshelf.model('Service', Service);
