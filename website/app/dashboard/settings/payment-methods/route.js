import Ember from 'ember';

export default Ember.Route.extend({
  ajax: Ember.inject.service(),

  setupController(controller, model) {
    const paymentMethod = model['payment-method'];
    if (paymentMethod) {
      controller.set('paymentMethod', Ember.Object.create({
        type       : paymentMethod.type,
        lastFour   : paymentMethod['last-four'],
        expMonth   : paymentMethod['exp-month'],
        expYear    : paymentMethod['exp-year'],
        holderName : paymentMethod['holder-name']
      }));
    }
  },

  model() {
    return this.get('ajax').request('/payment-methods');
  }
});
