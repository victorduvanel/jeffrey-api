import Ember from 'ember';

export default Ember.Controller.extend({
  user: Ember.inject.service(),

  firstName      : '',
  firstNameError : null,

  lastName       : '',
  lastNameError  : null,

  email          : '',
  emailError     : null,

  submitButtonDisabled: Ember.computed('firstName', 'lastName', 'email', function() {
    const user = this.get('user');

    let newFirstName = this.get('firstName');
    let newLastName  = this.get('lastName');
    let newEmail     = this.get('email');

    let userFirstName = user.get('firstName');
    let userLastName  = user.get('lastName');
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
    const {
      firstName,
      lastName,
      email,
    } = user.getProperties(
      'firstName',
      'lastName',
      'email'
    );

    this.setProperties({
      firstName,
      firstNameError : null,

      lastName,
      lastNameError  : null,

      email,
      emailError     : null
    });
  }
});
