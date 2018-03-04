import bookshelf    from '../services/bookshelf';
import Base         from './base';
import ProductPrice from './product-price';

const Product = Base.extend({
  tableName: 'products',

  prices() {
    return this.hasMany('ProductPrice');
  },

  price({ currency }) {
    return ProductPrice.query((qb) => {
      qb
        .where('product_id', '=', this.get('id'))
        .where('currency', '=', currency)
        .whereRaw('available_at <= NOW()')
        .orderBy('available_at', 'desc')
        .limit(1);
    })
      .fetch();
  }
}, {
  find: function(id) {
    return this.forge({ id }).fetch();
  }
});

export default bookshelf.model('Product', Product);
