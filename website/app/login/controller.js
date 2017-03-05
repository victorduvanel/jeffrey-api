import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service(),

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
          err = err.error;
          if (err.title === 'Invalid Credentials') {
            this.set('error', 'La connexion a échouée. Veuillez verifier vos identifiants.');
          } else {
            this.set('error', 'Impossible de vous identifier');
          }
        });
    }
  }
});
