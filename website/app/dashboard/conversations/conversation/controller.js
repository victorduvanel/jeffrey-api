import Ember from 'ember';
import styles from './style';

export default Ember.Controller.extend({
  ajax: Ember.inject.service(),
  notification: Ember.inject.service(),

  styles,

  message: '',

  init() {
    this._super(...arguments);

    this.get('notification')
      .on('conversation-activity', (attr) => {
        const conversationId = attr.conversation_id;

        if (conversationId === this.get('conversation').get('id')) {
          const messages = this.store.query('message', {
            conversation_id: conversationId
          });
          this.set('messages', messages);
        }
      });
  },

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
      })
        .then(() => {
          this.set('message', '');
        });
    }
  }
});
