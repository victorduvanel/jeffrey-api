import Ember from 'ember';
import Controller from '@ember/controller';

const { service } = Ember.inject;

export default Controller.extend({
  currentUser: service(),
  user: Ember.computed.alias('currentUser.user'),

  //confirmController: Ember.inject.controller('dashboard.phone-number.new.confirm'),

  actions: {
    paymentDetailsValidated() {
      console.log('ok');
      //this.get('confirmController').userInitiatedTransition();
    },

    subscribeButtonPressed() {
      switch (this.get('user.paymentMethodStatus')) {
        case 'ok':
          // this.get('confirmController').userInitiatedTransition();
          this.transitionToRoute('dashboard.phone-number.new.confirm');
          break;

        default:
        case 'not_set':
        case 'expired':
        case 'expired_soon':
          this.transitionToRoute('dashboard.phone-number.new.contact-details');
          break;
      }
    }
  }
});
