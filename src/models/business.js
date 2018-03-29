import uuid      from 'uuid';
import bookshelf from '../services/bookshelf';
import Base      from './base';

const Business = Base.extend({
  tableName: 'businesses',

  owner() {
    return this.belongsTo('User');
  },

  postalAddress() {
    return this.belongsTo('PostalAddress');
  }
});

export default bookshelf.model('Business', Business);
