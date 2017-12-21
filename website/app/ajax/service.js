import { inject as service }   from '@ember/service';
import { computed }            from '@ember/object';
import AjaxService             from 'ember-ajax/services/ajax';
import { isUnauthorizedError } from 'ember-ajax/errors';
import config                  from '../config/environment';

export default AjaxService.extend({
  session: service(),

  host: config.APP.API_HOST,
  // namespace: config.APP.API_NAMESPACE,

  headers: computed('session.isAuthenticated', {
    get() {
      let headers = {};
      const auth = this.get('session.data.authenticated');
      if (auth && auth.token_type === 'Bearer') {
        headers.Authorization = `Bearer ${auth.access_token}`;
      }
      return headers;
    }
  }),

  request() {
    return this._super(...arguments)
      .catch((err) => {
        if (isUnauthorizedError(err)) {
          this.get('session').invalidate();
          return;
        }

        throw err;
      });
  }
});
