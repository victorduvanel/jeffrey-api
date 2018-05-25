import uuid      from 'uuid';
import bookshelf from '../services/bookshelf';
import Base      from './base';

const PostalAddress = Base.extend({
  tableName: 'postal_addresses',

  async isOk() {
    return !!(
      this.get('city')
      && this.get('country')
      && this.get('line1')
      && this.get('postalCode')
      // && this.get('state')
    );
  },

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
  },

  async serialize() {
    return {
      id: this.get('id'),
      city: this.get('city'),
      country: this.get('country'),
      line1: this.get('line1'),
      line2: this.get('line2'),
      postalCode: this.get('postalCode'),
      state: this.get('state'),
    };
  }
}, {
  create: function(props = {}) {
    const id = uuid.v4();

    return this.forge({ id, ...props })
      .save(null, { method: 'insert' });
  }
});

export default bookshelf.model('PostalAddress', PostalAddress);
