import Ember from 'ember';

export default Ember.Controller.extend({
  confirmController: Ember.inject.controller('dashboard.phone-number.new.confirm'),

  actions: {
    paymentDetailsValidated() {
      console.log('ok');
      //this.get('confirmController').userInitiatedTransition();
    }
  }
});
