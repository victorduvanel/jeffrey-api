import Ember from 'ember';

export default Ember.Route.extend({
  ajax: Ember.inject.service(),

  setupController(controller, model) {
    controller.reset();
    controller.set('resetToken', model.access_token);
  },

  model(params) {
    const token = encodeURIComponent(params.token);

    //return this.get('ajax').request(`/reset-password/${token}`);
    return new Ember.RSVP.Promise((res, rej) => {
      rej(new Error('bonjour'));
    });
  }
});
