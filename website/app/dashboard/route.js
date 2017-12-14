import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { service } = Ember.inject;

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  currentUser: service(),
  notification: service(),
  session: service(),

  setupController(controller, model) {
    controller.set('phoneNumbers', model);
  },

  model() {
    return this
      .get('store')
      .findAll('phone-number');
  },

  afterModel() {
    this._super(...arguments);
    // this.get('notification').connect();
  },
});
