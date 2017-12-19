import Route from '@ember/routing/route';

export default Route.extend({
  setupController(controller, model) {
    controller.set('invoices', model);
  },

  model() {
    return this.get('store').findAll('invoice');
  }
});
