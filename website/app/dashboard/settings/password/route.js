import Ember from 'ember';

export default Ember.Route.extend({
  setupController(controller) {
    controller.reset();
    return this._super(...arguments);
  }
});
