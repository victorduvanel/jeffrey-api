import uuid      from 'uuid';
import bookshelf from '../services/bookshelf';
import Base      from './base';

const Business = Base.extend({
  tableName: 'businesses',

  postalAddress() {
    return this.belongsTo('PostalAddress');
  },

  async isOk() {
    if (!this.get('taxId') || !this.get('type')) {
      return false;
    }

    await this.load(['postalAddress']);
    const postalAddress = this.related('postalAddress');
    return postalAddress.isOk();
  },
}, {
  create: async function(props) {
    const id = uuid.v4();

    return this.forge({ id, ...props })
      .save(null, { method: 'insert' })
      .catch((err) => {
        throw err;
      });
  },
});

export default bookshelf.model('Business', Business);
