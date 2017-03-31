import uuid        from 'uuid';
import bookshelf   from '../services/bookshelf';
import Base        from './base';

const ConversationMessage = Base.extend({
  tableName: 'conversation_messages',

  conversation() {
    return this.belongsTo('Conversation');
  },

  message() {
    return this.belongsTo('Message');
  }
}, {
  create: async function({ conversation, message, type }) {
    const id = uuid.v4();

    return this.forge({
      id,
      conversationId: conversation.get('id'),
      messageId: message.get('id'),
      type
    })
      .save(null, { method: 'insert' });
  },
});

export default bookshelf.model('ConversationMessage', ConversationMessage);
