import Route from '@ember/routing/route';

export default Route.extend({
  setupController(controller) {
    controller.reset();
    return this._super(...arguments);
  }
});
