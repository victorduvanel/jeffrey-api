import uuid      from 'uuid';
import bookshelf from '../services/bookshelf';
import Base      from './base';

const Message = Base.extend({
  tableName: 'messages',

  conversation() {
    return this.belongsTo('Conversation');
  },

  from() {
    return this.belongsTo('User', 'from_id');
  },

  message() {
    return this.get('body');
  },

  createdAt() {
    return this.get('createdAt');
  }
}, {
  create: async function({ from, body, conversation }) {
    const id = uuid.v4();

    await bookshelf.knex.raw(
      `INSERT INTO messages
        (id, body, from_id, conversation_id, created_at, updated_at)
        VALUES (:id, :body, :fromId, :conversationId, NOW(), NOW())
        ON CONFLICT DO NOTHING
      `,
      {
        id,
        body,
        fromId: from.get('id'),
        conversationId: conversation.get('id'),
      }
    );

    return this.find(id);
  },

  find: function(id) {
    return this.forge({ id }).fetch();
  }
});

export default bookshelf.model('Message', Message);
