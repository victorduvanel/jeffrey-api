import Ember from 'ember';
import email from '../utils/email';

export default Ember.Controller.extend({
  ajax: Ember.inject.service(),
  recaptcha: Ember.inject.service(),

  isLoading  : false,
  email      : '',
  error      : null,
  success    : null,

  reset() {
    this.setProperties({
      isLoading   : false,
      email       : '',
      error       : null,
      success     : null,
      emailInputFocused : true
    });
  },

  resetPassword(emailAddress, captchaToken) {
    this.setProperties({
      isLoading: true,
      success: false,
      error: null
    });

    this.get('ajax')
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
      .catch(() => {
        this.set('error', 'Désolé, une erreur est survenue. Veuillez réessayer.');
      })
      .finally(() => {
        this.set('isLoading', false);
      });
  },

  actions: {
    submit() {
      const emailAddress = this.get('email');
      if (!emailAddress || !email.isValid(emailAddress)) {
        this.set('shakeEmailInput', true);
      } else {
        this.resetPassword(emailAddress, '');
        /*
        this.get('recaptcha')
          .check()
          .then((captchaToken) => {
            this.resetPassword(email, captchaToken);
          });
          */
      }
    }
  }
});
