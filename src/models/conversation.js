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
  },

  graphqlDef: function() {
    return `
      type Conversation {
        id: String!
        participants: [User]!
        messages: [Message]!
      }
    `;
  },

  resolver: {
    Query: {
      conversations: async (_, __, { user }, params) => {
        if (!user) {
          throw Unauthorized;
        }

        const conversationId = params.conversationId;

        const conversation = await Conversation.find({
          id: conversationId,
          user
        });

        if (!conversation) {
          return null;
        }

        // await conversation.load(['to', 'from']);

        // const toUser = conversation.related('to');
        // const fromUser = conversation.related('from');

        send({
          data: {
            id: conversation.get('id'),
            type: 'conversation',
            attributes: {
              to: toPhoneNumber.get('phoneNumber'),
              from: fromPhoneNumber.get('phoneNumber'),
              name: conversation.get('name') || ''
            }
          }
        });

        await user.load([
          'conversations',
          'conversations.to',
          'conversations.from'
        ]);

        const conversations = user.related('conversations');

        const responseData = conversations.map((conversation) => {
          const toPhoneNumber = conversation.related('to');
          const fromPhoneNumber = conversation.related('from');

          return {
            id: conversation.get('id'),
            type: 'conversation',
            attributes: {
              to: toPhoneNumber.get('phoneNumber'),
              from: fromPhoneNumber.get('phoneNumber'),
              name: conversation.get('name') || ''
            }
          };
        });

        res.send({
          data: responseData
        });

        return Promise.resolve(messages);
      },

      conversation: async (_, { conversationId }, { user }, params) => {
        const conversation = await Conversation.find(conversationId);

        await conversation.load(['participants']);

        const participants = conversation.related('participants');
        if (participants.map(user => user.id).includes(user.get('id'))) {
          return {
            id: conversation.get('id')
          };
        }

        return null;
      }
    },

    Conversation: {
      participants: async(conversation) => {
        await conversation.load(['participants']);
      },

      messages: async({ id }) => {
        const conversation = await Conversation.find(id);

        await conversation.load([{
          messages: query => query.orderBy('created_at', 'desc')
        }]);

        return conversation.related('messages').map(message => ({
          id: message.get('id'),
          message: message.get('body'),
          fromId: message.get('fromId'),
          time: message.get('createdAt').toISOString()
        }));
      },
    }
  }
});

export default bookshelf.model('Conversation', Conversation);
