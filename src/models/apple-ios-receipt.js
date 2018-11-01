import uuid         from 'uuid/v4';
import request      from 'request-promise';
import Promise      from 'bluebird';
import bookshelf    from '../services/bookshelf';
import Buckets      from '../services/google/storage';
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
  _create: async function({ user, receiptFileId, receipt }) {
    const id = uuid();

    await bookshelf.knex.raw(
      `INSERT INTO apple_ios_receipts
        (
          id, transaction_id, quantity,
          purchase_date, expires_date,
          product_id, user_id, receipt_file_id,
          created_at, updated_at
        )
        VALUES (
          :id, :transactionId, :quantity,
          :purchaseDate, :expiresDate,
          :productId, :userId, :receiptFileId,
          NOW(), NOW()
        )
        ON CONFLICT DO NOTHING
      `,
      {
        id,
        ...receipt,
        userId: user.get('id'),
        receiptFileId
      }
    );
  },

  createFromNotification: async function(receiptFileId, receipt) {
    const {
      transaction_id: transactionId,
      original_transaction_id: originalTransactionId,
      quantity,
      purchase_date: purchaseDate,
      expires_date_formatted: expiresDate
    } = receipt;

    const productId = receipt.product_id.split('_').join('-');

    // otherwise, it's an INITIAL_BUY notification and we do not have the user
    // info here. Request from the user's phone will create the approriate
    // receipt.
    if (transactionId !== originalTransactionId) {
      const originalReceipt = await AppleIosReceipt.where({
        transaction_id: originalTransactionId
      })
        .fetch({
          withRelated: ['user']
        });

      return this._create({
        user: originalReceipt.related('user'),
        receiptFileId,
        receipt: {
          quantity,
          productId,
          transactionId,
          purchaseDate,
          expiresDate
        }
      });
    }
  },

  create: async function({ receipt, user: requestUser }) {
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
        'receipt-data': receipt,
        password: config.apple.sharedSecret
      },
      json: true
    });

    if (result.status === 0) {
      const bucket = Buckets.appleReceipts;

      const receiptFileId = uuid();
      const file = bucket.file(`receipts/${receiptFileId}.json`);
      const fileStream = file.createWriteStream({
        metadata: {
          contentType: 'application/json'
        }
      });
      fileStream.end(JSON.stringify(result, null, 2));

      const receipts = result.receipt.in_app;

      return Promise.map(receipts, async (receipt) => {
        const quantity = parseInt(receipt.quantity, 10);
        const productId = receipt.product_id.split('_').join('-');
        const transactionId = receipt.transaction_id;
        const originalTransactionId = receipt.original_transaction_id;

        let user;
        if (transactionId === originalTransactionId) {
          user = requestUser;
        } else {
          const originalReceipt = await AppleIosReceipt.where({
            transaction_id: originalTransactionId
          })
            .fetch({
              withRelated: ['user']
            });

          if (!originalReceipt) {
            user = requestUser;
          } else {
            user = originalReceipt.related('user');
          }
        }

        return this._create({
          user,
          receiptFileId,
          receipt: {
            quantity,
            productId,
            transactionId,
            purchaseDate: receipt.purchase_date,
            expiresDate: receipt.expires_date
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
