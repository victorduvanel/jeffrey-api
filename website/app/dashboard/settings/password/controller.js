import Ember from 'ember';

export default Ember.Controller.extend({
  newPassword          : '',
  newPasswordError     : null,

  currentPassword      : '',
  currentPasswordError : null,

  reset() {
    this.setProperties({
      newPassword          : '',
      newPasswordError     : null,

      currentPassword      : '',
      currentPasswordError : null
    });
  },

  actions: {
    updatePassword() {
      let error = false;

      let { currentPassword, newPassword } = this.getProperties(
        'newPassword', 'currentPassword');

      if (!currentPassword) {
        error = true;

        this.set('currentPasswordError', 'Please enter your current password');
      }

      if (!newPassword) {
        error = true;

        this.set('newPasswordError', 'Please enter your new password');
      }

      if (error) {
        return;
      }

    }
  }
});
