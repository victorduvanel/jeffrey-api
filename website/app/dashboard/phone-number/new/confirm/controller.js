import Ember from 'ember';

export default Ember.Controller.extend({
  transitionInitiatedByUser: false,

  userInitiatedTransition() {
    this.set('transitionInitiatedByUser', true);
    this.transitionToRoute('dashboard.phone-number.new.confirm');
  },

  didTransition() {
    if (this.get('transitionInitiatedByUser')) {
      this.set('transitionInitiatedByUser', false);
      this.set('loading', true);

      const phoneNumber = this.get('store').createRecord('phone-number');
      this.set('phoneNumber', phoneNumber);
      phoneNumber.save();
    } else {
      this.transitionToRoute('dashboard');
    }
  }
});
