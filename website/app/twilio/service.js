import Ember from 'ember';

export default Ember.Service.extend(Ember.Evented, {
  ajax: Ember.inject.service(),
  session: Ember.inject.service(),

  twilio: null,
  deviceReady: false,

  init() {
    this._super(...arguments);

    const promise = new Ember.RSVP.Promise((resolve, reject) => {
      const sdkUrl = '//media.twiliocdn.com/sdk/js/client/v1.3/twilio.min.js';

      const script = document.createElement('script');
      script.src = sdkUrl;

      script.onerror = (err) => {
        reject(err);
      };

      script.onload = () => {
        const twilio = window.Twilio;

        this.initTwilio(twilio);
        resolve(twilio);
      };

      document.body.appendChild(script);
    });

    this.set('promise', promise);
  },

  initTwilio(twilio) {
    this.set('twilio', twilio);

    twilio.Device.disconnect(() => {
      this.trigger('deviceDisconnected');
      this.set('deviceReady', false);
    });

    twilio.Device.ready(() => {
      this.trigger('deviceReady');
      this.set('deviceReady', true);
    });

    twilio.Device.error((err) => {
      console.error(err);
    });
  },

  then() {
    return this.get('promise').then(...arguments);
  },

  getToken() {
    const auth = this.get('session.data.authenticated');
    if (auth) {
      return auth.access_token;
    }
    return null;
  },

  startCall(fromNumber, toNumber) {
    this.initDevice()
    .then(() => {
      const twilio = this.get('twilio');

      twilio.Device.connect({
        fromNumber,
        toNumber,
        token: this.getToken()
      });
    });
  },

  _initDevicePromise: null,
  initDevice() {
    if (this.get('deviceReady')) {
      return Ember.RSVP.Promise.resolve();
    }

    let _initDevicePromise = this.get('_initDevicePromise');
    if (!_initDevicePromise) {
      _initDevicePromise = this
        .then((twilio) => {
          return this.get('ajax')
            .request('/twilio/token', {
              method: 'POST'
            })
            .then((res) => {
              const token = res.token;

              return new Ember.RSVP.Promise((resolve) => {
                if (this.get('deviceReady')) {
                  resolve();
                } else {
                  this.one('deviceReady', () => {
                    resolve();
                  });

                  twilio.Device.setup(token);
                }
              })
                .finally(() => {
                  this.set('_initDevicePromise', null);
                });
            });
        });

      this.set('_initDevicePromise', _initDevicePromise);
    }

    return _initDevicePromise;
  }
});
