import Ember from 'ember';
import email from '../utils/email';

export default Ember.Controller.extend({
  ajax: Ember.inject.service(),
  session: Ember.inject.service(),

  inputClassNames: '',

  isLoading  : false,
  email      : '',
  error      : null,
  success    : null,

  showCaptcaha: false,

  reset() {
    this.setProperties({
      isLoading   : false,
      email       : '',
      error       : null,
      success     : null,
      showCaptcha : false
    });
  },

  actions: {
    submitEmail() {
      const emailAddress = this.get('email');
      if (!email || !email.isValid(emailAddress)) {
        setTimeout(() => {
          this.set('inputClassNames', '');
          setTimeout(() => {
            this.set('inputClassNames', 'fx-shake');
            setTimeout(() => {
              this.set('inputClassNames', '');
            }, 800);
          }, 0);
        }, 0);
      } else {
        this.set('showCaptcha', true);
      }
    },

    captchaValidated(captcha) {
      const emailAddress = this.get('email');

      this.set('isLoading', true);

      this.get('ajax').post('/signup', {
        data: {
          email: emailAddress,
          captcha
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

    retry() {
      this.setProperties({
        success: false,
        error: null,
        showCaptcha: false
      });
    }
  }
});
