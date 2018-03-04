import moment       from 'moment';
import { render }   from '../../services/handlebars';
import oauth2       from '../../middlewares/oauth2';
import Invoice      from '../../models/invoice';
import { NotFound } from '../../errors';
import { products } from '../../../resources/products.json';

export const get = [
  oauth2,
  async (req, res) => {
    const user = req.user;

    const invoices = await Invoice.findAll({ user });

    res.send({
      data: invoices.map((invoice) => {
        return {
          id: invoice.get('id'),
          type: 'invoices',
          attributes: {
            amount: invoice.get('amount'),
            currency: invoice.get('currency'),
            status: invoice.get('status'),
            'created-at': invoice.get('createdAt')
          }
        };
      })
    });
  }
];

const formatAmount = (amount, currency) => {
  const symbols = {
    eur: '€'
  };

  const value = amount.toString();
  const major = value.slice(0, -2) || 0;
  const minor = value.slice(-2);

  let symbol = symbols[currency];

  return `${major}.${minor} ${symbol}`;
};

const productName = (id, locale) => {
  for (let i = 0; i < products.length; ++i) {
    if (products[i].id === id) {
      return products[i].name[locale];
    }
  }
};

export const getOne = [
  oauth2,
  async (req, res) => {
    const user = req.user;
    const invoiceId = req.params.invoice_id;

    const invoice = await Invoice.find(invoiceId);
    await invoice.load('user');
    const customer = invoice.related('user');

    const currency = invoice.get('currency');

    if (!invoice || invoice.get('userId') !== user.get('id')) {
      throw NotFound;
    }

    const invoiceDate = moment(invoice.get('createdAt')).format('DD/MM/YYYY');
    const html = await render('invoice', {
      invoiceId: invoice.get('id'),
      invoiceDate,
      total: formatAmount(invoice.get('amount'), currency),
      customer: {
        fullName: `${customer.get('firstName')} ${customer.get('lastName')}`,
        email: customer.get('email'),
      },
      items: invoice.related('items').map((item) => {
        const amount = item.get('amount');
        const quantity = item.get('quantity');

        return {
          id: item.get('id'),
          amount: formatAmount(amount, currency),
          name: productName(item.get('productId'), 'fr'),
          quantity,
          total: formatAmount(amount * quantity, currency)
        };
      })
    });

    res.send(html);
  }
];
