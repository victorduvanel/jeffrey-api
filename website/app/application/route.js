import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

const { service } = Ember.inject;

export default Ember.Route.extend(ApplicationRouteMixin, {
  currentUser: service(),

  beforeModel() {
    return this._loadCurrentUser();
  },

  sessionAuthenticated() {
    this._super(...arguments);
    this._loadCurrentUser();

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

  _loadCurrentUser() {
    return this.get('currentUser')
      .load()
      .catch((err) => {
        console.log('fail');
        console.log(err);
        this.get('session').invalidate();
      });
  },

  sessionInvalidated() {
    // this._super(...arguments);
    this.store.unloadAll();
    this.transitionTo('login');
  }
});
