import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  currentUser: service(),

  setupController(controller) {
    controller.reset();
  },

  model() {
    return this.get('currentUser').load();
  }
});
