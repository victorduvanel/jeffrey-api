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

  redirect(phoneNumbers, transition) {
    if (phoneNumbers.get('length')) {
      const phoneNumber = phoneNumbers.objectAt(0);
      const to = 'dashboard.phone-number.phone-number';
      if (transition.targetName.substr(0, to.length) !== to) {
        this.transitionTo(to, phoneNumber);
      }
    } else {
      this.transitionTo('dashboard.phone-number.new');
    }
  }
});
