import Ember from 'ember';

export default Ember.Service.extend({
  isAuthenticated: false,

  session: Ember.inject.service(),
  ajax: Ember.inject.service(),

  reset() {
    this.setProperties({
      id              : null,
      firstName       : null,
      lastName        : null,
      email           : null,
      isAuthenticated : false
    });
  },

  check: Ember.observer('session.isAuthenticated', function() {
    if (this.get('session.isAuthenticated')) {
      return this.get('ajax')
        .request('/me')
        .then((res) => {
          this.setProperties({
            id              : res.id,
            firstName       : res.first_name,
            lastName        : res.last_name,
            email           : res.email,
            isAuthenticated : true
          });
        })
        .catch(() => {
          this.reset();
        });
    } else {
      this.reset();
    }
  })
});
