import Ember from 'ember';

export default Ember.Controller.extend({
  ajax: Ember.inject.service(),
  toast: Ember.inject.service(),

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

            Ember.run.next(() => {
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
