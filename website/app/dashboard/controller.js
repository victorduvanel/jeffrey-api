import Ember from 'ember';

const { service } = Ember.inject;

export default Ember.Controller.extend({
  session: Ember.inject.service(),
  currentUser: service(),
  user: Ember.computed.alias('currentUser.user'),

  phoneNumberController: Ember.inject.controller('dashboard.phone-number.phone-number'),
  phoneNumbersController: Ember.inject.controller('dashboard.phone-number'),

  selectedPhoneNumber: Ember.computed.alias('phoneNumberController.phoneNumber'),
  phoneNumbers: Ember.computed.alias('phoneNumbersController.phoneNumbers'),

  availablePhoneNumbers: Ember.computed('selectedPhoneNumber', 'phoneNumbers', function() {
    const selectedPhoneNumber = this.get('selectedPhoneNumber');
    const phoneNumbers = this.get('phoneNumbers');

    if (!selectedPhoneNumber) {
      return phoneNumbers;
    }

    if (!phoneNumbers) {
      return phoneNumbers.filter((phoneNumber) => phoneNumber !== selectedPhoneNumber);
    }
  }),

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
