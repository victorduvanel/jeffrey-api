import Route from '@ember/routing/route';
import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';

export default Route.extend({
  ajax: service(),

  setupController(controller, model) {
    const paymentMethod = model['payment-method'];
    if (paymentMethod) {
      controller.set('paymentMethod', EmberObject.create({
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
