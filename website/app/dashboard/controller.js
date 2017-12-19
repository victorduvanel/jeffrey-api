import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Controller.extend({
  session: service(),
  pushNotification: service(),

  currentUser: service(),
  user: alias('currentUser.user'),

  selectedPhoneNumber: computed('phoneNumbers', function() {
    const phoneNumbers = this.get('phoneNumbers');
    return phoneNumbers.objectAt(0);
  }),

  availablePhoneNumbers: computed('selectedPhoneNumber', 'phoneNumbers', function() {
    const selectedPhoneNumber = this.get('selectedPhoneNumber');
    const phoneNumbers = this.get('phoneNumbers');

    if (!selectedPhoneNumber) {
      return phoneNumbers;
    }

    if (!phoneNumbers) {
      return phoneNumbers.filter((phoneNumber) => phoneNumber !== selectedPhoneNumber);
    }
  }),

  userLinkLabel: computed('user.firstName', 'user.lastName', function() {
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
    },

    enablePushNotifications() {
      const pushNotification = this.get('pushNotification');
      if (pushNotification.get('platformSupported')) {

        pushNotification.getSubscription()
          .then((subscription) => {
            if (!subscription) {
              return pushNotification.createSubscription()
                .then((subscription) => {
                  return subscription;
                });
            } else {
              return subscription;
            }
          });
      }
    }
  }
});
