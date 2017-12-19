import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { next } from '@ember/runloop';

export default Controller.extend({
  ajax: service(),
  toast: service(),

  resetToken: null,

  isLoading  : false,
  password   : '',
  error      : null,

  reset() {
    this.setProperties({
      isLoading   : false,
      password    : '',
      error       : null
    });
  },

  actions: {
    submit() {
      if (this.get('isLoading')) {
        return;
      }

      const password = this.get('password');

      if (!password || password.length < 4) {
        this.set('shakePasswordInput', true);
      } else {
        this.set('isLoading', true);
        this.get('ajax').request('/me', {
          method: 'PATCH',
          data: { password },
          headers: {
            Authorization: `Bearer ${this.get('resetToken')}`
          }
        })
          .then(() => {
            this.transitionToRoute('login');

            next(() => {
              const toast = this.get('toast');

              toast.success(
                'Votre mot de passe à bien été réinitialisé. Vous pouvez maintenant vous connecter.'
              );
            });
          })
          .catch(() => {
            this.set('error', 'Désolé, impossible de modifier votre mot de passer.');
          })
          .finally(() => {
            this.set('isLoading', false);
          });
      }
    }
  }
});
