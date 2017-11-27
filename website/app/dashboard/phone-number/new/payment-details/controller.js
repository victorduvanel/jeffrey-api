import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    paymentDetailsValidated() {
      this.transitionToRoute('dashboard.phone-number.new.confirm');
    }
  }
});
