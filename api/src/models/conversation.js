import uuid                from 'uuid';
import config              from '../config';
import bookshelf           from '../services/bookshelf';
import Base                from './base';
import ConversationMessage from './conversation-message';
import Product             from './product';

const Conversation = Base.extend({
  tableName: 'conversations',

  user() {
    return this.belongsTo('User');
  },

  to() {
    return this.belongsTo('PhoneNumber', 'to_id');
  },

  from() {
    return this.belongsTo('PhoneNumber', 'from_id');
  },

  conversationMessages() {
    return this.hasMany('ConversationMessage');
  },

  async incoming(message) {
    await this.load('user');

    const user = this.related('user');

    const product = await Product.find(config.app.incomingMessageProductId);
    const productPrice = await product.price({ currency: 'eur' });
    await user.addCredits(-1 * productPrice.get('value'));

    user.sendMessage({
      type: 'conversation-activity',
      attributes: {
        conversation_id: this.get('id')
      }
    });

    return ConversationMessage.create({
      conversation: this,
      message: message,
      type: 'incoming'
    });
  },

  async outgoing(message) {
    await this.load('user');

    const user = this.related('user');

    const product = await Product.find(config.app.outgoingMessageProductId);
    const productPrice = await product.price({ currency: 'eur' });
    await user.addCredits(-1 * productPrice.get('value'));

    user.sendMessage({
      type: 'conversation-activity',
      attributes: {
        conversation_id: this.get('id')
      }
    });

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

  find: function({ id, user }) {
    return this.forge({
      id,
      userId: user.get('id'),
    })
      .fetch();
  }
});

export default bookshelf.model('Conversation', Conversation);