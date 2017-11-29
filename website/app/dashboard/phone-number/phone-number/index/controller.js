import Ember from 'ember';

export default Ember.Controller.extend({
  ajax: Ember.inject.service(),
  message: '',
  toPhoneNumber: '',

  actions: {
    sendMessage() {
      const {
        message,
        toPhoneNumber,
        phoneNumber
      } = this.getProperties(
        'message',
        'toPhoneNumber',
        'phoneNumber'
      );

      this.get('ajax').request('/conversations', {
        method: 'POST',
        data: {
          to: toPhoneNumber,
          from: phoneNumber.get('phoneNumber'),
          message
        }
      })
      .then((res) => {
        console.log(res);
      });
    }
  }
});
