import uuid                from 'uuid';
import bookshelf           from '../services/bookshelf';
import Base                from './base';
import ConversationMessage from './conversation-message';

const Conversation = Base.extend({
  tableName: 'conversations',

  user() {
    return this.belongsTo('User');
  },

  to() {
    return this.belongsTo('PhoneNumber');
  },

  from() {
    return this.belongsTo('PhoneNumber');
  },

  incoming(message) {
    return ConversationMessage.create({
      conversation: this,
      message: message,
      type: 'incoming'
    });
  },

  outgoing(message) {
    return ConversationMessage.create({
      conversation: this,
      message: message,
      type: 'outgoing'
    });
  }
}, {
  create: async function({ user }) {
    const id = uuid.v4();

    return this.forge({
      id,
      userId: user.get('id'),
    })
      .save(null, { method: 'insert' });
  },

  findOrCreate: async function({
    user, from, to
  }) {
    const userId = user.get('id');

    const fromId = from.get('id');
    const toId   = to.get('id');

    await bookshelf.knex.raw(
      `INSERT INTO conversations
        (id, user_id, from_id, to_id, last_activity, created_at, updated_at)
        VALUES (:id, :userId, :fromId, :toId, NOW(), NOW(), NOW())
        ON CONFLICT DO NOTHING
      `,
      {
        id: uuid.v4(),
        userId,
        fromId,
        toId
      }
    );

    return await new this({ userId, fromId, toId }).fetch();
  },
});

export default bookshelf.model('Conversation', Conversation);
