import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  ajax: service(),
  session: service(),

  isLoading      : false,

  firstName      : '',
  firstNameError : null,

  lastName       : '',
  lastNameError  : null,

  password       : '',
  passwordError  : null,

  queryParams: ['code'],
  code: null,

  reset() {
    this.setProperties({
      isLoading      : false,

      firstName      : '',
      firstNameError : null,

      lastName       : '',
      lastNameError  : null,

      password       : '',
      passwordError  : null
    });
  },

  actions: {
    _() {},

    finishRegistration() {
      if (this.get('isLoading')) {
        return;
      }

      let error = false;

      this.setProperties({
        firstNameError : null,
        lastNameError  : null
      });

      let { lastName, firstName, password } = this.getProperties(
        'firstName', 'lastName', 'password'
      );

      lastName  = lastName.trim();
      firstName = firstName.trim();
      password  = password.trim();

      if (!lastName || !lastName.length) {
        error = true;
        this.set('lastNameError', 'Please indicate your last name');
      }

      if (!firstName || !firstName.length) {
        error = true;
        this.set('firstNameError', 'Please indicate your first name');
      }

      if (!password || !password.length) {
        error = true;
        this.set('firstNameError', 'Please choose a password');
      }

      if (error) {
        return;
      }

      this.set('isLoading', true);

      const accessToken = this.get('model.access_token.token');

      return this.get('ajax').request(
        `/me`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`
          },
          data: {
            first_name: firstName,
            last_name : lastName,
            password  : password
          }
        }
      )
        .then(() => {
          this.get('session')
            .authenticate('authenticator:oauth2', {
              access_token: accessToken,
              token_type: 'Bearer'
            });
        })
        .finally(() => this.set('isLoading', false));
    }
  }
});
