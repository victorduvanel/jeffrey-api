import bookshelf from '../services/bookshelf';
import Base      from './base';

const Country = Base.extend({
  tableName: 'countries',
}, {

  findByCode: function(code) {
    return this.forge({ code }).fetch();
  },

  find: function(id) {
    return this.forge({ id }).fetch();
  }
});

export default bookshelf.model('Country', Country);
