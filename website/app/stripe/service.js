import RSVP from 'rsvp';
import Service from '@ember/service';
import config from '../config/environment';

export default Service.extend({
  promise: null,

  init() {
    this._super(...arguments);

    const promise = new RSVP.Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v2/';


      if (script.readyState) { // IE, incl. IE9
        script.onreadystatechange = () => {
          if (script.readyState === 'loaded' || script.readyState === 'complete') {
            script.onreadystatechange = null;
            resolve(window.Stripe);
          }
        };
      } else {
        script.onload = () => { // Other browsers
          resolve(window.Stripe);
        };
      }

      script.onerror = (err) => {
        reject(err);
      };

      document.body.appendChild(script);
    });

    promise.then((stripe) => {
      stripe.setPublishableKey(config.APP.STRIPE_PUBLISHABLE_KEY);
    });

    this.set('promise', promise);
  },

  then() {
    this.get('promise').then(...arguments);
  },

  createTokenFromCard({
    number,
    expMonth,
    expYear,
    cvc,

    name,
    addressLine1,
    addressLine2,
    addressCity,
    addressState,
    addressZip,
    addressCountry
  }) {
    return this.get('promise').then((stripe) => {
      return new RSVP.Promise((resolve, reject) => {
        stripe.card.createToken({
          number,
          exp_month: expMonth,
          exp_year: expYear,
          cvc,
          name,
          address_line1: addressLine1,
          address_line2: addressLine2,
          address_city: addressCity,
          address_state: addressState,
          address_zip: addressZip,
          address_country: addressCountry
        }, (status, res) => {
          if (res.error) {
            reject(res.error);
          } else {
            resolve(res);
          }
        });
      });
    });
  }
});
