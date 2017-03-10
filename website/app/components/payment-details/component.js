import Ember from 'ember';

export default Ember.Component.extend({
  cardNumber: '',

  stripe: Ember.inject.service(),
  ajax: Ember.inject.service(),

  paymentMethod: null,

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
          this.set('isLoading', false);
        });
    }
  }
});
