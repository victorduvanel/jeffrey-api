import uuid      from 'uuid';
import bookshelf from '../services/bookshelf';
import Base      from './base';

const PostalAddress = Base.extend({
  tableName: 'postal_addresses'
}, {
  create: function(props) {
    const id = uuid.v4();

    return this.forge({ id, ...props })
      .save(null, { method: 'insert' });
  },
});

export default bookshelf.model('PostalAddress', PostalAddress);
