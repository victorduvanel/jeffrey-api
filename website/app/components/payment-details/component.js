import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { debug } from '@ember/debug';

export default Component.extend({
  isLoading: false,

  cardNumber: '4000002500000003',
  cardholderName: 'William Riancho',
  expirationDate: '10/24',
  cvc: '123',

  stripe: service(),
  ajax: service(),

  reset() {
    this.setProperties({
      isLoading: false,
      cardNumber: '',
      cardholderName: '',
      expirationDate: '',
      cvc: '',
    });
  },

  createCard({
    cardholderName,
    cardNumber,
    expMonth,
    expYear,
    cvc
  }) {
    return this.get('stripe')
      .createTokenFromCard({
        number: cardNumber,
        expMonth,
        expYear,
        cvc,
        name: cardholderName
      })
      .then((token) => {
        return this.get('ajax').request('/payment-methods', {
          method: 'POST',
          data: {
            stripe_token: token.id
          }
        });
      });
  },

  actions: {
    createCard() {
      if (this.get('isLoading')) {
        return;
      }

      this.set('isLoading', true);

      const {
        cardholderName,
        cardNumber,
        expirationDate,
        cvc
      } = this.getProperties(
        'cardholderName',
        'cardNumber',
        'expirationDate',
        'cvc'
      );

      const expirationDateSplit = expirationDate.split('/');
      if (expirationDateSplit.length !== 2) {
        this.set('isLoading', false);
        debug('invalid expiration date');
        return;
      }

      const expMonth = expirationDateSplit[0].trim();
      const expYear = expirationDateSplit[1].trim();

      this.createCard({
        cardNumber,
        expMonth,
        expYear,
        cvc,
        cardholderName
      })
        .then(() => {
          const onValidated = this.get('onValidated');

          if (onValidated) {
            onValidated();
          }
        })
        .finally(() => {
          this.reset();
        });
    }
  }
});
