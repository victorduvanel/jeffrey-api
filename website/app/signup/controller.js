import Ember from 'ember';
import email from '../utils/email';

export default Ember.Controller.extend({
  ajax: Ember.inject.service(),

  isLoading  : false,
  emailError : null,
  email      : '',
  error      : null,
  captcha    : null,
  success    : null,

  reset() {
    this.setProperties({
      email   : '',
      error   : null,
      captcha : null,
      success : null
    });
  },

  submitDisabled: Ember.computed('captcha', 'email', function() {
    return !this.get('email') || !this.get('captcha');
  }),

  actions: {
    signup() {
      this.set('error', null);

      const emailAddress = this.get('email');
      if (!email.isValid(emailAddress)) {
        this.set('emailError', 'Invalid email address');
        return;
      }

      this.set('emailError', null);

      this.set('isLoading', true);

      this.get('ajax').post('/signup', {
        data: {
          email   : emailAddress,
          captcha : this.get('captcha')
        }
      })
        .then(() => {
          this.setProperties({
            email   : '',
            success : true
          });
        })
        .catch(() => {
          this.set('error', 'Unable to sign you up.');
        })
        .finally(() => {
          this.set('isLoading', false);
        });
    }
  }
});
