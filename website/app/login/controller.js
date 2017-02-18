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
          if (err.error === 'invalid_grant') {
            this.set('error', 'Wrong credentials');
          } else {
            this.set('error', 'An error occured');
          }
        });
    }
  }
});
