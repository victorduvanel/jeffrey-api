import uuid                from 'uuid';
import config              from '../config';
import bookshelf           from '../services/bookshelf';
import Base                from './base';
import pubsub, { CONVERSATION_ACTIVITY_TOPIC } from '../services/graphql/pubsub';

const Conversation = Base.extend({
  tableName: 'conversations',

  participants() {
    return this.belongsToMany('User', 'conversation_participants');
  },

  messages() {
    return this.hasMany('Message');
  },

  async notifyParticipants(message) {
    await this.load(['participants']);
    const participants = this.related('participants');

    participants.map(user => {
      pubsub.publish(`${CONVERSATION_ACTIVITY_TOPIC}.${user.get('id')}`, {
        newMessage: {
          id: message.get('id'),
          message: message.get('body'),
          time: message.get('createdAt'),
          fromId: message.get('fromId')
        }
      });

      user.sendMessage({
        type: 'conversation-activity',
        attributes: {
          conversationId: this.get('id'),
          from: message.get('userId')
        }
      });
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

  find: function(id) {
    return this.forge({ id }).fetch();
  }
});

export default bookshelf.model('Conversation', Conversation);
