import Ember from 'ember';

export default Ember.Route.extend({
  redirect(transition) {
    this.transitionTo('dashboard.phone-number');
  }
});
