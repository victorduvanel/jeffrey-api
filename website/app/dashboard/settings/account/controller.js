import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  ajax: service(),
  currentUser: service(),
  user: alias('currentUser.user'),

  isLoading      : false,
  firstName      : '',
  firstNameError : null,

  lastName       : '',
  lastNameError  : null,

  email          : '',
  emailError     : null,

  submitButtonDisabled: computed('firstName', 'lastName', 'email', function() {
    const user = this.get('user');

    let newFirstName = this.get('firstName');
    let newLastName  = this.get('lastName');
    // let newEmail     = this.get('email');

    let userFirstName = user.get('firstName') || '';
    let userLastName  = user.get('lastName') || '';
    // let userEmail     = user.get('email');

    newFirstName  = newFirstName.trim();
    newLastName   = newLastName.trim();
    // newEmail      = newEmail.trim();
    userFirstName = userFirstName.trim();
    userLastName  = userLastName.trim();
    // userEmail     = userEmail.trim();

    return (
      (newFirstName === userFirstName) &&
      (newLastName  === userLastName )
    );
  }),

  reset() {
    const user = this.get('user');

    let firstName = user.get('firstName') || '';
    let lastName  = user.get('lastName') || '';
    let email     = user.get('email');

    this.setProperties({
      firstName,
      firstNameError : null,

      lastName,
      lastNameError  : null,

      email,
      emailError     : null
    });
  },

  actions: {
    saveInfo() {
      if (this.get('isLoading')) {
        return;
      }

      this.set('isLoading', true);

      const firstName = this.get('firstName').trim();
      const lastName  = this.get('lastName').trim();

      this.get('ajax')
        .request('/me', {
          method: 'PATCH',
          data: {
            first_name: firstName,
            last_name: lastName
          }
        })
        .then(() => {
          return this.get('currentUser').load();
        })
        .finally(() => {
          this.set('isLoading', false);
        });
    }
  }
});
