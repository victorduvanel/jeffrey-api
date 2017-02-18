import Ember from 'ember';

export default Ember.Route.extend({
  setupController(controller, model) {
    controller.set('invoices', model);
  },

  model() {
    return this.get('store').findAll('invoice');
  }
});
