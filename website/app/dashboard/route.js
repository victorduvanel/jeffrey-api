import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  setupController(controller, phoneNumbers) {
    controller.set('phoneNumbers', phoneNumbers);
  },

  model() {
    return this
      .get('store')
      .findAll('phone-number');
  }
});
