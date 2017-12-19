import RSVP from 'rsvp';
import Service, { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import config from '../config/environment';

const urlB64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  /* eslint-disable no-useless-escape */
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  /* eslint-enable no-useless-escape */

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export default Service.extend({
  ajax: service(),

  publicKey: config.APP.PUSH_NOTIFICATION_PUBLIC_KEY,

  workerScriptUrl: computed(function() {
    const metas = document.head.getElementsByTagName('meta');
    for (const meta of metas) {
      if (meta.getAttribute('name') === 'notification-worker') {
        const script = meta.getAttribute('content');
        return script;
      }
    }
    return null;
  }),

  platformSupported: computed(function() {
    return ('serviceWorker' in navigator && 'PushManager' in window);
  }),

  createSubscription() {
    return this.registerWorker()
      .then((registration) => {
        const applicationServerKey = urlB64ToUint8Array(this.get('publicKey'));

        return registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey
        })
          .then((subscription) => {
            return this.get('ajax').request('/web-notification', {
              method: 'POST',
              data: {
                payload: JSON.stringify(subscription)
              }
            })
              .then(() => {
                return subscription;
              });
          });
      });
  },

  getSubscription() {
    return this.registerWorker()
      .then((registration) => {
        registration.pushManager.getSubscription()
          .then((subscription) => {
            return subscription;
          });
      });
  },

  _registerProm: null,
  registerWorker() {
    let _registerProm = this.get('_registerProm');
    if (!_registerProm) {
      _registerProm = new RSVP.Promise((resolve, reject) => {
        if (!this.get('platformSupported')) {
          reject(new Error('Platform not supported'));
          return;
        }

        const workerScriptUrl = this.get('workerScriptUrl');
        if (!workerScriptUrl) {
          reject(new Error('Worker script url not specified'));
          return;
        }

        navigator.serviceWorker.register(workerScriptUrl)
          .then((registration) => {
            resolve(registration);
          })
          .catch((err) => {
            reject(err);
          });
      });
      this.set('_registerProm', _registerProm);
    }
    return _registerProm;
  }
});
