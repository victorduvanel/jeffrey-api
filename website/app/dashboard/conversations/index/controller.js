import Ember from 'ember';

export default Ember.Controller.extend({
  ajax: Ember.inject.service(),

  actions: {
    createConversation() {
      const message = this.get('message');
      const phoneNumber = this.get('phoneNumber');
      const to = this.get('to');

      this.get('ajax').request('/conversations', {
        method: 'POST',
        data: {
          message,
          to,
          from: phoneNumber.get('phoneNumber')
        }
      })
        .then(() => {
          this.set('message', '');
        });
    }
  }
});
