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

  formattedCredit: computed('credit', 'credit.currency', 'credit.amount', function() {
    const credit = this.get('credit');
    const amount = credit.get('amount');
    const amountLabel = formatAmount(amount, credit.get('currency'));

    return amountLabel;
  })
});
