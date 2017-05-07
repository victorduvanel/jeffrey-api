import bookshelf from '../services/bookshelf';
import Base      from './base';

const ProductPrice = Base.extend({
  tableName: 'product_prices',

  product: function() {
    return this.belongsTo('Product');
  }
}, {
});

export default bookshelf.model('ProductPrice', ProductPrice);
