import RSVP from 'rsvp';
import Service, { inject as service } from '@ember/service';
import User from 'prestine/user';

export default Service.extend({
  session: service(),
  ajax: service(),

  init() {
    this._super(...arguments);
    this.set('user', User.create({ }));
  },

  _load(properties) {
    const user = this.get('user');
    user.setProperties({
      id                  : properties.id,
      accountDisabled     : properties.account_disabled,
      firstName           : properties.first_name,
      lastName            : properties.last_name,
      email               : properties.email,
      paymentMethodStatus : properties.payment_method_status,
      creditAutoReload    : properties.credit_auto_reload
    });
    user.get('credit').setProperties(properties.credit);
  },

  load() {
    if (this.get('session.isAuthenticated')) {
      return this.get('ajax')
        .request('/me')
        .then((res) => {
          this._load(res);
          this.set('isAuthenticated', true);
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
