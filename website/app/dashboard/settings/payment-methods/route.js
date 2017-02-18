import Ember from 'ember';

export default Ember.Route.extend({
  ajax: Ember.inject.service(),

  setupController(controller, model) {
    controller.set('paymentMethod', model['payment-method']);
  },

  model() {
    console.log('bonjour');
    return this.get('ajax').request('/payment-methods');
  }
});
