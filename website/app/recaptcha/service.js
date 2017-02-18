import Ember from 'ember';
import config from '../config/environment';

export default Ember.Service.extend({
  promise: null,
  siteKey: config.APP.RECAPTCHA_SITE_KEY,

  init() {
    const callbackName = '___recapthca_load_callback___';

    this._super(...arguments);

    const promise = new Ember.RSVP.Promise((resolve, reject) => {
      window[callbackName] = function() {
        delete window[callbackName];
        resolve(window.grecaptcha);
      };

      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit&onload=' + callbackName;

      script.onerror = (err) => {
        reject(err);
      };

      document.body.appendChild(script);
    });

    this.set('promise', promise);
  },

  then() {
    this.get('promise').then(...arguments);
  }
});
