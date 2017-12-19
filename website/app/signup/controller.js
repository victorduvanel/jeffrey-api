import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import email from 'prestine/utils/email';

export default Controller.extend({
  ajax: service(),
  session: service(),
  recaptcha: service(),

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

    return this.get('ajax').post('/signup', {
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
      });
  },

  actions: {
    submitEmail() {
      const emailAddress = this.get('email');
      if (!emailAddress || !email.isValid(emailAddress)) {
        this.shakeInput();
      } else {
        this.set('isLoading', true);
        this.get('recaptcha')
          .check()
          .then((token) => {
            return this.captchaValidated(token);
          })
          .finally(() => {
            this.set('isLoading', false);
          });
      }
    },

    retry() {
      this.setProperties({
        success: false,
        error: null
      });
    },

    subscribeButtonPressed() {
      this.set('emailInputFocused', true);
      this.shakeInput();
    }
  }
});
