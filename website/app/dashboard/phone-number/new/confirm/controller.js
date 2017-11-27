import Ember from 'ember';

const { service } = Ember.inject;

export default Ember.Controller.extend({

  currentUser: service(),
  user: Ember.computed.alias('currentUser.user'),

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
