import OAuth2PasswordGrant from 'ember-simple-auth/authenticators/oauth2-password-grant';
import config from '../config/environment';

export default OAuth2PasswordGrant.extend({
  serverTokenEndpoint: config.APP.API_HOST + '/oauth/token',
  serverTokenRevocationEndpoint: config.APP.API_HOST + '/oauth/revoke',
  clientId: config.APP.API_CLIENT_ID
});
