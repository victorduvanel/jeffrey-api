import Ember from 'ember';

export default Ember.Route.extend({
  setupController(controller, model) {
    controller.set('phoneNumber', model);
  },

  model() {
    const model = this.modelFor('dashboard.phone-number.phone-number');
    return model;
  }
});
