import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  user: Ember.inject.service(),

  model() {
    console.log('check user');
    return this.get('user')
      .check()
      .then((r) => {
        console.log('check user done');
        return r;
      });
  }
});
