import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

export default Ember.Route.extend(ApplicationRouteMixin, {
  sessionAuthenticated() {
    console.log('sessionAuthenticated');
    this._super(...arguments);
    /*
    const attemptedTransition = this.get('session.attemptedTransition');

    if (attemptedTransition) {
      attemptedTransition.retry();
      this.set('session.attemptedTransition', null);
    } else {
      this.transitionTo(Configuration.routeAfterAuthentication);
    }
    */
  },

  sessionInvalidated() {
    // this._super(...arguments);
    this.store.unloadAll();
    this.transitionTo('login');
  }
});
