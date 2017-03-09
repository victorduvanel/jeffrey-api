import Ember from 'ember';

const { service } = Ember.inject;

export default Ember.Controller.extend({
  session: Ember.inject.service(),
  currentUser: service(),
  user: Ember.computed.alias('currentUser.user'),

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
