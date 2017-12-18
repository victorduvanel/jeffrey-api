import Ember from 'ember';
import User from 'prestine/user';

export default Ember.Service.extend({
  session: Ember.inject.service(),
  ajax: Ember.inject.service(),

  load() {
    if (this.get('session.isAuthenticated')) {
      const auth = this.get('session.data.authenticated');
      console.log(auth);

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
            credit              : Ember.Object.create(res.credit),
            creditAutoReload    : res.credit_auto_reload
          }));
        });
    } else {
      return Ember.RSVP.resolve();
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
