import bookshelf from '../services/bookshelf';
import Base      from './base';

const Provider = Base.extend({
  tableName: 'providers',
}, {
  graphqlDef: function() {
    return `
      type Provider {
        id: String!
        name: String!
      }
    `;
  },

  resolver: {
    Query: {
      providers:  async function() {
        return [
          {
            id: '123',
            name: 'Morray'
          },
          {
            id: '456',
            name: 'Michel'
          }
        ];
      }
    }
  }
});

export default bookshelf.model('Provider', Provider);
