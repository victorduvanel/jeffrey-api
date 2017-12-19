import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  session: service(),
  toast: service(),

  error: null,
  email: '',
  password: '',

  reset() {
    this.setProperties({
      error    : null,
      email    : '',
      password : ''
    });
  },

  actions: {
    login() {
      this.set('error', null);

      const { email, password } = this.getProperties('email', 'password');
      this.get('session')
        .authenticate('authenticator:oauth2', email, password)
        .catch((err) => {
          if (err && err.error) {
            err = err.error;
            if (err.title === 'Invalid Credentials') {
              this.get('toast').error('La connexion a échouée. Veuillez verifier vos identifiants.');
              return;
            }
          }

          this.get('toast').error('Impossible de vous identifier');
        });
    }
  }
});
