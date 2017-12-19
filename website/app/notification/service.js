import RSVP from 'rsvp';
import { observer } from '@ember/object';
import Evented from '@ember/object/evented';
import { next } from '@ember/runloop';
import Service, { inject as service } from '@ember/service';
import config from '../config/environment';

export default Service.extend(Evented, {
  host: config.APP.API_HOST,
  session: service(),
  currentUser: service(),

  lastTry: null,

  shouldBeConnected: false,
  connected: false,

  connectingPromise: null,

  connect() {
    /*
    const now = (new Date()).getTime();
    const lastTry = this.get('lastTry');

    if (lastTry && now - lastTry < 10000) {
      run.later(() => {
        this._connect();
      }, 10000 - (now - lastTry));
      return;
    }
    */

    this._connect();
  },

  _connect() {
    this.set('shouldBeConnected', true);
    if (this.get('connected')) {
      return RSVP.Promise.resolve();
    }

    return this.initWebSocket()
      .catch(() => {
        this.connect();
      });
  },

  initWebSocket() {
    this.get('lastTry', new Date());

    let connectingPromise = this.get('connectingPromise');
    if (!connectingPromise) {
      const host = this.get('host');
      let url;

      if (host.indexOf('https:') === 0) {
        url = `wss://${host.substr(8)}/notifications`;
      } else if (host.indexOf('http:') === 0) {
        url = `ws://${host.substr(7)}/notifications`;
      } else {
        return RSVP.Promise.reject(new Error('Unspported protocol'));
      }

      connectingPromise = this.get('currentUser')
        .getSingleUseToken()
        .then((token) => {

          token = encodeURIComponent(token);
          url = `${url}?access_token=${token}`;

          return new RSVP.Promise((resolve, reject) => {
            const socket = new WebSocket(url);
            this.set('lastTry', (new Date()).getTime());

            this.set('socket', socket);

            socket.addEventListener('open', () => {
              this.set('connected', true);
              this.set('socket', socket);

              resolve();
            });

            socket.addEventListener('error', (event) => {
              this.set('connected', false);
              this.set('socket', null);
              reject(event);

            });

            socket.addEventListener('close', () => {
              next(() => {
                this.set('connected', false);
                this.set('socket', null);
              });
            });

            socket.addEventListener('message', (event) => {
              next(() => {
                this.messageReceived(event);
              });
            });
          });
        });

      connectingPromise.finally(() => {
        this.set('connectingPromise', null);
      });

      this.set('connectingPromise', connectingPromise);
    }

    return connectingPromise;
  },

  messageReceived(event) {
    const payload = JSON.parse(event.data);

    if (typeof payload === 'object') {
      if (typeof payload.type === 'string') {
        this.trigger(payload.type, payload.attributes);
      }
    }
  },

  connectionObserver: observer('connected', function() {
    if (!this.get('connected') && this.get('shouldBeConnected')) {
      this.connect();
    }
  })
});
