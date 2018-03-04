import uuid         from 'uuid';
import request      from 'request-promise';
import bookshelf    from '../services/bookshelf';
import Base         from './base';
import ProductPrice from './product';
import config       from '../config';

const AppleIosReceipt = Base.extend({
  tableName: 'apple_ios_receipts',

  user() {
    return this.belongsTo('User');
  },

  product() {
    return this.belongsTo('Product');
  },

  price() {
    return ProductPrice.query((qb) => {
      qb
        .where('product_id', '=', this.get('product_id'))
        .where('available_at', '<=', this.get('created_at'))
        .orderBy('available_at', 'desc')
        .limit(1);
    })
      .fetch();
  }
}, {
  _create: async function({ user, receipt }) {
    const id = uuid.v4();

    await bookshelf.knex.raw(
      `INSERT INTO apple_ios_receipts
        (
          id, transaction_id, quantity,
          product_id, user_id,
          created_at, updated_at
        )
        VALUES (
          :id, :transactionId, :quantity,
          :productId, :userId,
          NOW(), NOW()
        )
        ON CONFLICT DO NOTHING
      `,
      {
        id,
        ...receipt,
        userId: user.get('id')
      }
    );
  },

  create: async function({ receipt, user }) {
    let checkURL;

    if (config.PRODUCTION) {
      checkURL = 'https://buy.itunes.apple.com/verifyReceipt';
    } else {
      checkURL = 'https://sandbox.itunes.apple.com/verifyReceipt';
    }

    const result = await request({
      method: 'POST',
      uri: checkURL,
      body: {
        'receipt-data': receipt
      },
      json: true
    });

    if (result.status === 0) {
      const receipts = result.receipt.in_app;

      return receipts.map((receipt) => {
        const quantity = parseInt(receipt.quantity, 10);
        const productId = receipt.product_id.split('_').join('-');
        const transactionId = receipt.transaction_id;

        return this._create({
          user,
          receipt: {
            quantity, productId, transactionId
          }
        });
      });
    } else {
      throw new Error('Invalid response from the app store');
    }
  },

  find: function(id) {
    return this.forge({ id }).fetch();
  }
});

export default bookshelf.model('AppleIosReceipt', AppleIosReceipt);
