import Ember from 'ember';

export default Ember.Route.extend({
  setupController(controller, model) {
    controller.set('phoneNumbers', model);
  },

  model() {
    return this.get('store').findAll('phone-number');
  }
});
