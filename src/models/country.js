import bookshelf from '../services/bookshelf';
import Base      from './base';

const Country = Base.extend({
  tableName: 'countries',

  name() {
    return this.get('name');
  },

  phoneCode() {
    return this.get('phoneCode');
  },

  flag() {
    return this.get('flag');
  },

  code() {
    return this.get('code');
  },

  currency() {
    return this.get('currencyCode');
  },

  requiresCivilLiabilityInsurance() {
    return this.get('requiresCivilLiabilityInsurance');
  }
}, {
  findByCode: function(code) {
    return this.forge({ code }).fetch();
  },

  find: function(id) {
    return this.forge({ id }).fetch();
  }
});

export default bookshelf.model('Country', Country);
