import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import Service, { inject as service } from '@ember/service';
import User from 'prestine/user';

export default Service.extend({
  session: service(),
  ajax: service(),

  load() {
    if (this.get('session.isAuthenticated')) {
      const auth = this.get('session.data.authenticated');

      return this.get('ajax')
        .request('/me')
        .then((res) => {
          this.set('user', User.create({
            id                  : res.id,
            accountDisabled     : res.account_disabled,
            firstName           : res.first_name,
            lastName            : res.last_name,
            email               : res.email,
            paymentMethodStatus : res.payment_method_status,
            isAuthenticated     : true,
            credit              : EmberObject.create(res.credit),
            creditAutoReload    : res.credit_auto_reload
          }));
        });
    } else {
      return RSVP.resolve();
    }
  },

  getSingleUseToken() {
    return this.get('ajax')
      .request('/oauth/single-use-token', {
        method: 'POST'
      })
      .then((res) => {
        return res.access_token;
      });
  }
});
