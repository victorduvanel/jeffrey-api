import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return this
      .get('store')
      .findAll('phone-number');
  },

  setupController(controller, model) {
    controller.set('phoneNumbers', model);
  },

  redirect(phoneNumbers) {
    if (phoneNumbers.get('length')) {
      const phoneNumber = phoneNumbers.objectAt(0);
      this.transitionTo('dashboard.phone-number.phone-number', phoneNumber);
    } else {
      this.transitionTo('dashboard.phone-number.new');
    }
  }
});
