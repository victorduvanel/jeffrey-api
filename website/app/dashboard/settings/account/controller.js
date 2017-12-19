import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  currentUser: service(),
  user: alias('currentUser.user'),

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
    let newEmail     = this.get('email');

    let userFirstName = user.get('firstName') || '';
    let userLastName  = user.get('lastName') || '';
    let userEmail     = user.get('email');

    newFirstName  = newFirstName.trim().toLowerCase();
    newLastName   = newLastName.trim().toLowerCase();
    newEmail      = newEmail.trim().toLowerCase();
    userFirstName = userFirstName.trim().toLowerCase();
    userLastName  = userLastName.trim().toLowerCase();
    userEmail     = userEmail.trim().toLowerCase();

    return (
      (newFirstName === userFirstName) &&
      (newLastName  === userLastName ) &&
      (newEmail     === userEmail    )
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

    }
  }
});
