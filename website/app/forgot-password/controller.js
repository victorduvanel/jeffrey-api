import Ember from 'ember';
import email from '../utils/email';

export default Ember.Controller.extend({
  ajax: Ember.inject.service(),
  recaptcha: Ember.inject.service(),

  isLoading  : false,
  email      : '',
  error      : null,
  success    : false,

  reset() {
    this.setProperties({
      isLoading   : false,
      email       : '',
      error       : null,
      success     : false,
      emailInputFocused : true
    });
  },

  resetPassword(emailAddress, captchaToken) {
    this.setProperties({
      success: false,
      error: null
    });

    return this.get('ajax')
      .post('/reset-password', {
        data: {
          email: emailAddress,
          captcha: captchaToken
        }
      })
      .then(() => {
        this.setProperties({
          email   : '',
          success : true
        });
      })
      .catch((err) => {
        this.set('error', 'Désolé, une erreur est survenue. Veuillez réessayer.');
        throw err;
      });
  },

  actions: {
    submit() {
      if (this.get('isLoading')) {
        return;
      }

      const emailAddress = this.get('email');
      if (!emailAddress || !email.isValid(emailAddress)) {
        this.set('shakeEmailInput', true);
      } else {
        this.set('isLoading', true);
        this.get('recaptcha')
          .check()
          .then((captchaToken) => {
            return this.resetPassword(emailAddress, captchaToken);
          })
          .finally(() => {
            this.set('isLoading', false);
          });
      }
    }
  }
});
