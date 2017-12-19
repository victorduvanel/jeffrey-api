import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  ajax: service(),

  setupController(controller, model) {
    controller.reset();
    if (model) {
      controller.set('resetToken', model.access_token);
    } else {
      controller.set('error', 'Votre lien de réinitialisation n’est pas valide');
    }
  },

  model(params) {
    const token = encodeURIComponent(params.token);

    return this.get('ajax')
      .request(`/reset-password/${token}`);
  }
});
