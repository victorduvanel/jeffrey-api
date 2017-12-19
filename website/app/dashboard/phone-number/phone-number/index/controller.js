import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  ajax: service(),
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
      });
    }
  }
});
