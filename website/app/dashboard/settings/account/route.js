import Ember from 'ember';

const { service } = Ember.inject;

export default Ember.Route.extend({
  currentUser: service(),

  setupController(controller) {
    controller.reset();
  },

  model() {
    return this.get('currentUser').load();
  }
});
