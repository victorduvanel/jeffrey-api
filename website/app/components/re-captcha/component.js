import Ember from 'ember';

export default Ember.Component.extend({
  recaptcha: Ember.inject.service(),

  classNames: 'recaptcha',

  hl    : null,
  theme : 'light',  // dark light
  type  : 'image',  // audio image
  size  : 'normal', // normal compact

  token: null,

  didInsertElement() {
    const recaptchaService = this.get('recaptcha');
    recaptchaService.then((recaptcha) => {
      const self = this;
      const el = this.get('element');

      recaptcha.render(el, {
        sitekey : recaptchaService.get('siteKey'),
        theme   : this.get('theme'),
        type    : this.get('type'),
        size    : this.get('size'),
        hl      : this.get('hl'),
        callback(token) {
          self.set('token', token);
        },

        'expired-callback'() {
          self.set('token', null);
        }
      });
    });
  }
});
