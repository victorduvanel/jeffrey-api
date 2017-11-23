import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { service } = Ember.inject;

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  currentUser: service(),
  notification: service(),
  session: service(),

  afterModel() {
    this._super(...arguments);
    // this.get('notification').connect();
  },
});
