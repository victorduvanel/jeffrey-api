import Ember from 'ember';

const { service } = Ember.inject;

export default Ember.Route.extend({
  currentUser: service(),

  model() {
    return this.get('currentUser').load();
  }
});
