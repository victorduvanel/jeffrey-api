import uuid         from 'uuid';
import { NotFound } from '../errors';
import bookshelf    from '../services/bookshelf';
import Base         from './base';
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
        body: 'New message',
      });
    });
  }
}, {
  findOrCreate: async function(participants) {
    const { knex } = bookshelf;

    /**
     * We basically need to find the conversation that matches exactly the
     * those participants
     */

    const conversations = await knex
      .select('conversations.id', 'conversation_participants.user_id')
      .from('conversations')
      .leftJoin('conversation_participants', 'conversations.id', 'conversation_participants.conversation_id')
      .whereIn(
        'conversation_participants.user_id',
        [
          '3c656ce5-1e21-4332-a268-d7599f2f0e40',
          '3a82bd8d-d941-48ee-b1d9-e4030a80afcd'
        ]
      );

    const conversationsParticipantsMap = {};
    const { length } = conversations;

    for (let i = 0; i < length; ++i) {
      const conversation = conversations[i];
      if (!conversationsParticipantsMap[conversation.id]) {
        conversationsParticipantsMap[conversation.id] = [ conversation.user_id ];
      } else {

      }
    }


    return conversations;

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
      conversation: async (_, { userId }, { user } /*, params */) => {

        console.log(
          'conversation',
          userId,
          user.get('id')
        );

        return null;

        const conversation = await Conversation.find(conversationId);

        if (!conversation) {
          throw NotFound;
        }

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
