import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service(),
  user: Ember.inject.service(),

  userLinkLabel: Ember.computed('user.firstName', 'user.lastName', function() {
    let label = 'Mon compte';

    const firstName = this.get('user.firstName');
    const lastName = this.get('user.lastName');
    if (firstName) {
      label = firstName;

      if (lastName) {
        label += ' ' + lastName[0] + '.';
      }
    }

    return label;
  }),

  actions: {
    logout() {
      this.get('session').invalidate();
    }
  }
});
