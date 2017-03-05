import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    subscribeButtonPressed() {
      this.transitionToRoute('dashboard.phone-number.new.payment-details');
    }
  }
});
