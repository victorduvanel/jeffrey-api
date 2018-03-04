import uuid      from 'uuid';

import bookshelf from '../services/bookshelf';
import Base      from './base';

export const ProductPriceNotFound = new Error('Product Price Not Found');

const InvoiceItem = Base.extend({
  tableName: 'invoice_items',

  product() {
    return this.belongsTo('Product');
  },

  invoice() {
    return this.belongsTo('Invoice');
  }
}, {
  create: async function({ invoice, product, quantity = 1 }) {
    const id = uuid.v4();

    const currency = invoice.get('currency');

    const price = await product.price({ currency });

    if (!price) {
      throw ProductPriceNotFound;
    }

    return this.forge({
      id,
      invoiceId: invoice.get('id'),
      productId: product.get('id'),
      quantity,
      amount: price.get('value')
    })
      .save(null, { method: 'insert' });
  }
});

export default bookshelf.model('InvoiceItem', InvoiceItem);
