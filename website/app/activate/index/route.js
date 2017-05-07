import Ember from 'ember';

export default Ember.Route.extend({
  ajax: Ember.inject.service(),

  queryParams: {
    code: {
      refreshModel: true
    }
  },

  model(params) {
    return Ember.RSVP.Promise.resolve({
      access_token: '1234'
    });
    if (params.code) {
      const code = encodeURIComponent(params.code);

      return this.get('ajax').request(`/activate/${code}`, {
        method: 'POST'
      });
    } else {
      return Ember.RSVP.Promise.reject(new Error('Code d’activation manquant'));
    }
  },

  setupController(controller) {
    controller.reset();
    this._super(...arguments);
  }
});
