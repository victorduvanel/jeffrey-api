import Ember from 'ember';
import email from '../utils/email';

export default Ember.Controller.extend({
  ajax: Ember.inject.service(),
  session: Ember.inject.service(),
  recaptcha: Ember.inject.service(),

  emailInputFocused: true,
  inputClassNames: '',

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

  shakeInput() {
    this.set('shakeEmailInput', true);
  },

  captchaValidated(token) {
    const emailAddress = this.get('email');

    this.set('isLoading', true);

    this.get('ajax').post('/signup', {
      data: {
        email: emailAddress,
        captcha: token
      }
    })
      .then(() => {
        this.setProperties({
          email   : '',
          success : true
        });
      })
      .catch(() => {
        this.set('error', 'Désolé, impossible de vous enregistrer. Veuillez réessayer.');
      })
      .finally(() => {
        this.set('isLoading', false);
      });
  },

  actions: {
    submitEmail() {
      const emailAddress = this.get('email');
      if (!email || !email.isValid(emailAddress)) {
        this.shakeInput();
      } else {
        this.get('recaptcha')
          .check()
          .then((token) => {
            this.captchaValidated(token);
          });
      }
    },

    retry() {
      this.setProperties({
        success: false,
        error: null,
        showCaptcha: false
      });
    },

    subscribeButtonPressed() {
      this.set('emailInputFocused', true);
      this.shakeInput();
    }
  }
});
