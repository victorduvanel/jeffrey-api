import RSVP from 'rsvp';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  ajax: service(),

  queryParams: {
    code: {
      refreshModel: true
    }
  },

  model(params) {
    if (params.code) {
      const code = encodeURIComponent(params.code);

      return this.get('ajax').request(`/activate/${code}`, {
        method: 'POST'
      });
    } else {
      return RSVP.Promise.reject(new Error('Code d’activation manquant'));
    }
  },

  setupController(controller) {
    controller.reset();
    this._super(...arguments);
  }
});
