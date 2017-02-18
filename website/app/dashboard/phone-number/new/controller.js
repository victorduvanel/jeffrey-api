import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    purchasePhoneNumber() {
      const phoneNumber = this
        .get('store')
        .createRecord('phone-number');

      phoneNumber.save();
    }
  }
});
