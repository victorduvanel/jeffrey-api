import Ember from 'ember';

const { service } = Ember.inject;

export default Ember.Controller.extend({
  currentUser: service(),
  user: Ember.computed.alias('currentUser.user'),

  confirmController: Ember.inject.controller('dashboard.phone-number.new.confirm'),

  actions: {
    paymentDetailsValidated() {
      console.log('ok');
      //this.get('confirmController').userInitiatedTransition();
    },

    subscribeButtonPressed() {
      switch (this.get('user.paymentMethodStatus')) {
        case 'ok':
          this.get('confirmController').userInitiatedTransition();
          break;

        default:
        case 'not_set':
        case 'expired':
        case 'expired_soon':
          this.transitionToRoute('dashboard.phone-number.new.payment-details');
          break;
      }
    }
  }
});
