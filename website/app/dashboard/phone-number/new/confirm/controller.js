import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';

export default Controller.extend({

  currentUser: service(),
  user: alias('currentUser.user'),

  phoneNumber: null,
  isLoading: false,

  reset() {
    this.setProperties({
      phoneNumber: null,
      isLoading: false
    });
  },

  actions: {
    confirmPurchase() {
      this.set('isLoading', true);

      const phoneNumber = this.get('store')
        .createRecord('phone-number');

      phoneNumber
        .save()
        .then(() => {
          this.set('phoneNumber', phoneNumber);
        })
        .finally(() => {
          this.set('isLoading', false);
        });
    }
  }

});
