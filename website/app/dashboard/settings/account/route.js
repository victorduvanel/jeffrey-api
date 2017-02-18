import Ember from 'ember';

export default Ember.Route.extend({
  user: Ember.inject.service(),

  setupController(controller) {
    controller.reset();
    return this._super(...arguments);
  },

  model() {
    return this.get('user').check();
  }
});
