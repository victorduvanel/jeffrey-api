import uuid      from 'uuid';
import bookshelf from '../services/bookshelf';
import Base      from './base';

const PostalAddress = Base.extend({
  tableName: 'postal_addresses',

  async update(params) {
    const { country } = params;
    if (typeof country === 'string') {
      if (!['US', 'FR', 'JP', 'KR', 'US'].includes(country)) {
        throw new Error('Invalid country');
      }
    }

    const props = [
      'city',
      'country',
      'line1',
      'line2',
      'postalCode',
      'state'
    ];

    let value;
    for (let prop of props) {
      value = params[prop];
      if (typeof value === 'string') {
        value = value.trim();
        if (!value.length) {
          value = null;
        }
        this.set(prop, value);
      } else if (value === null) {
        this.set(prop, null);
      }
    }

    if (this.hasChanged()) {
      await this.save();
    }
  }
}, {
  create: function(props = {}) {
    const id = uuid.v4();

    return this.forge({ id, ...props })
      .save(null, { method: 'insert' });
  },

  graphqlDef: function() {
    return `
      type PostalAddress {
        id: ID!
        city: String
        country: String
        line1: String
        line2: String
        postalCode: String
        state: String
      }
    `;
  }
});

export default bookshelf.model('PostalAddress', PostalAddress);
