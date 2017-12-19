import RSVP from 'rsvp';
import { next } from '@ember/runloop';
import Service from '@ember/service';
import config from '../config/environment';

export default Service.extend({
  promise: null,

  siteKey: config.APP.RECAPTCHA_SITE_KEY,
  language: config.APP.RECAPTCHA_LANGUAGE,

  init() {
    const callbackName = '___recaptcha_load_callback___';

    this._super(...arguments);

    const promise = new RSVP.Promise((resolve, reject) => {
      window[callbackName] = function() {
        delete window[callbackName];
        resolve(window.grecaptcha);
      };

      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit&onload=' + callbackName;

      const language = this.get('language');
      if (language) {
        script.src += '&hl=' + window.encodeURIComponent(language);
      }

      script.onerror = (err) => {
        reject(err);
      };

      document.body.appendChild(script);
    });

    this.set('promise', promise);
  },

  then() {
    return this.get('promise').then(...arguments);
  },

  check() {
    return this.then((recaptcha) => {
      return new RSVP.Promise((resolve) => {
        const div = document.createElement('div');
        document.body.appendChild(div);
        div.style.display = 'none';

        next(() => {
          const widgetId = recaptcha.render(div, {
            size: 'invisible',
            sitekey: this.get('siteKey'),
            callback: (token) => {
              div.remove();
              resolve(token);
            }
          });
          recaptcha.execute(widgetId);
        });
      });
    });
  }
});
