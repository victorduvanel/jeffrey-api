import Ember       from 'ember';
import AjaxService from 'ember-ajax/services/ajax';
import config      from '../config/environment';

export default AjaxService.extend({
  session: Ember.inject.service(),

  host: config.APP.API_HOST,
  // namespace: config.APP.API_NAMESPACE,

  headers: Ember.computed('session.isAuthenticated', {
    get() {
      let headers = {};
      const auth = this.get('session.data.authenticated');
      if (auth && auth.token_type === 'Bearer') {
        headers['Authorization'] = 'Bearer ' + auth.access_token;
      }
      return headers;
    }
  })
});
