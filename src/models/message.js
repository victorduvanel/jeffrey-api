import uuid         from 'uuid';
import bookshelf    from '../services/bookshelf';
import Conversation from '../models/conversation';
import Base         from './base';
import pubsub, { CONVERSATION_ACTIVITY_TOPIC } from '../services/graphql/pubsub';

const Message = Base.extend({
  tableName: 'messages',

  conversation() {
    return this.belongsTo('Conversation');
  },

  from() {
    return this.belongsTo('User', 'from_id');
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
  },

  graphqlDef: function() {
    return `
      type Message {
        id: String!
        message: String!
        from: User!
        time: String!
      }
    `;
  },

  resolver: {
    Message: {
      from: async({ id }) => {
        const message = await Message.find(id);
        await message.load(['from']);
        const from = message.related('from');
        return {
          id: from.get('id'),
          profilePicture: from.get('profilePicture')
        };
      }
    },

    Mutation: {
      newMessage: async (_, { conversationId, message: body }, { user }) => {
        try {
          const conversation = await Conversation.find(conversationId);
          await conversation.load(['participants']);

          const message = await Message.create({ from: user, body, conversation });
          conversation.notifyParticipants(message);

          return {
            id: message.get('id'),
            message: message.get('body'),
            from: message.get('fromId'),
            time: message.get('createdAt')
          };
        } catch (err) {
          console.error(err);
        }
      }
    },
    Subscription: {
      newMessage: {
        subscribe: (_, __ /* { conversationId } */, { user }) => {
          if (!user) {
            return null;
          }

          return pubsub.asyncIterator(`${CONVERSATION_ACTIVITY_TOPIC}.${user.get('id')}`);
        }
      }
    },
  }
});

export default bookshelf.model('Message', Message);
