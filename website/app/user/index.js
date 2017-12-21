import EmberObject, { computed } from '@ember/object';
import formatAmount from 'prestine/utils/format-amount';

export default EmberObject.extend({
  id                  : null,
  firstName           : null,
  lastName            : null,
  email               : null,
  paymentMethodStatus : null,
  isAuthenticated     : false,
  credit              : null,
  creditAutoReload    : null,
  accountDisabled     : false,

  init() {
    this._super(...arguments);
    this.set('credit', EmberObject.create({
      currency: 'EUR',
      amount: 0
    }));
  },

  formattedCredit: computed('credit.currency', 'credit.amount', function() {
    const credit = this.get('credit');
    const amount = credit.get('amount');
    const amountLabel = formatAmount(amount, credit.get('currency'));

    return amountLabel;
  }),

  paymentDetailsNeedToBeUpdated: computed('paymentMethodStatus', function () {
    switch (this.get('paymentMethodStatus')) {
      case 'ok':
        return false;
      default:
      case 'not_set':
      case 'expired':
      case 'expired_soon':
        return true;
    }
  })
});
