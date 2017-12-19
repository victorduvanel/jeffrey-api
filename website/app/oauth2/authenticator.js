import RSVP from 'rsvp';
import OAuth2PasswordGrant from 'ember-simple-auth/authenticators/oauth2-password-grant';
import { isEmpty } from '@ember/utils';
import { run } from '@ember/runloop';
import { assign } from '@ember/polyfills';
import config from '../config/environment';

export default OAuth2PasswordGrant.extend({
  serverTokenEndpoint: config.APP.API_HOST + '/oauth/token',
  serverTokenRevocationEndpoint: config.APP.API_HOST + '/oauth/revoke',
  clientId: config.APP.API_CLIENT_ID,

  authenticate(identification, password, scope = [], headers = {}) {
    if (typeof identification === 'object') {
      /**
       * Inject raw access_token.
       * Needed for activate route.
       */
      let response = identification;

      return new RSVP.Promise((resolve, reject) => {
        run(() => {
          if (!this._validate(response)) {
            reject('access_token is missing in server response');
          }

          const expiresAt = this._absolutizeExpirationTime(response.expires_in);
          this._scheduleAccessTokenRefresh(response.expires_in, expiresAt, response.refresh_token);
          if (!isEmpty(expiresAt)) {
            response = assign(response, { expires_at: expiresAt });
          }

          resolve(response);
        });
      });
    } else {
      return this._super(identification, password, scope, headers);
    }
  }
});
