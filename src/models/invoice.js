import uuid        from 'uuid';
import bookshelf   from '../services/bookshelf';
import stripe      from '../services/stripe';
import * as handlebars from '../services/handlebars';
import { sendEmail }   from '../services/mailgun';
import Base        from './base';
import InvoiceItem from './invoice-item';

export const InvoiceAlreadyPaid     = new Error('Invoice Already Paid');
export const InvoiceCannotBeUpdated = new Error('Invoice Cannot Be Updated');
export const PaymentFailed          = new Error('Payment Failed');
export const UserCannotBeCharged    = new Error('User Cannot Be Charged');

const Invoice = Base.extend({
  tableName: 'invoices',

  user() {
    return this.belongsTo('User');
  },

  items() {
    return this.hasMany('InvoiceItem');
  },

  addProduct({ product, quantity = 1}) {
    if (this.get('status') !== Invoice.status.pending) {
      throw InvoiceCannotBeUpdated;
    }

    return InvoiceItem.create({
      invoice: this,
      product,
      quantity
    });
  },

  sendEmailNotification: async function() {
    await this.load('user');

    const user = this.related('user');

    const message = await handlebars.render('email/new-invoice', {
      title: 'Prestine - Nouvelle facture disponible'
    });

    return sendEmail({
      from: '"Prestine" <noreply@prestine.io>',
      to: user.get('email'),
      subject: 'Prestine - Nouvelle facture disponible',
      message
    });
  },

  charge: async function() {
    if (this.get('status') === Invoice.status.paid) {
      throw InvoiceAlreadyPaid;
    }

    await this.load(['items.product']);
    const items = this.related('items');

    const amount = await items.reduce((total, item) => {
      return total + item.get('amount') * item.get('quantity');
    }, 0);

    this.set('amount', amount);
    await this.save();

    const currency = this.get('currency');

    await this.load('user.stripeCustomer');
    const user = this.related('user');
    const customers = user.related('stripeCustomer');

    if (!customers.length) {
      throw UserCannotBeCharged;
    }

    const customerId = customers.at(0).get('id');

    if (user.get('friend') !== true) {
      try {
        await stripe.charges.create({
          amount,
          currency,
          customer: customerId,
        });
      } catch (err) {
        this.set('status', Invoice.status.failed);
        await this.save();
        throw PaymentFailed;
      }
    }

    this.set('status', Invoice.status.paid);
    await this.save();

    await this.sendEmailNotification();
  }
}, {

  status: {
    paid     : 'paid',
    pending  : 'pending',
    failed   : 'failed'
  },

  create: async function({ user, currency }) {
    const id = uuid.v4();

    return this.forge({
      id,
      currency,
      userId: user.get('id'),
      status: Invoice.status.pending
    })
      .save(null, { method: 'insert' });
  },

  findAll: function({ user }) {
    return this.query((qb) => {
      qb.where({
        user_id: user.get('id')
      })
        .whereNotNull('amount');
    })
      .fetchAll();
  },

  find: function(id) {
    return this.forge({ id })
      .fetch({
        withRelated: ['items']
      });
  }
});

export default bookshelf.model('Invoice', Invoice);
