import Ember from 'ember';

export default Ember.Controller.extend({
  ajax: Ember.inject.service(),

  message: '',

  actions: {
    sendMessage() {
      const message = this.get('message');
      const conversationId = this.get('conversation.id');

      this.get('ajax').request('/messages', {
        method: 'POST',
        data: {
          message,
          conversation_id: conversationId
        }
      });
    }
  }
});
