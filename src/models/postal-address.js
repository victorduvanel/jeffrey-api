import uuid      from 'uuid';
import bookshelf from '../services/bookshelf';
import Base      from './base';

const PostalAddress = Base.extend({
  tableName: 'postal_addresses'
});

export default bookshelf.model('PostalAddress', PostalAddress);
