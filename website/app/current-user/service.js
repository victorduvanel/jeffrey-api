import Ember from 'ember';

export default Ember.Service.extend({
  session: Ember.inject.service(),
  ajax: Ember.inject.service(),

  load() {
    if (this.get('session.isAuthenticated')) {
      return this.get('ajax')
        .request('/me')
        .then((res) => {
          this.set('user', Ember.Object.create({
            id                  : res.id,
            firstName           : res.first_name,
            lastName            : res.last_name,
            email               : res.email,
            paymentMethodStatus : res.payment_method_status,
            isAuthenticated     : true
          }));
        });
    } else {
      return Ember.RSVP.resolve();
    }
  }
});
