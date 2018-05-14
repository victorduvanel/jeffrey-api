import Promise      from 'bluebird';
import uuid         from 'uuid';
import { NotFound } from '../errors';
import bookshelf    from '../services/bookshelf';
import Base         from './base';
import User         from './user';
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
  create: async function(participants) {
    const { knex } = bookshelf;
    const id = uuid.v4();

    await knex.transaction(async (t) => {
      await knex('conversations').insert({ id });
      await Promise.map(participants, async (participant) => (
        knex('conversation_participants').transacting(t).insert({
          conversation_id: id,
          user_id: participant.get('id')
        })
      ));
    });

    return this.find(id);
  },

  findOrCreate: async function(participants) {
    /**
     * We basically need to find the conversation that matches exactly the
     * those participants
     */

    const participantIds = participants.map(participant => `'${participant.get('id')}'`).join();

    const conversations = await bookshelf.knex.raw(`
      select
      conversations.id

      from conversations

      where (
        select count(*)
        from
        conversation_participants
        where conversation_participants.conversation_id = conversations.id
      ) = (
        select count(*)
        from
        conversation_participants
        where conversation_participants.user_id in (
          ${participantIds}
        )
        and conversation_participants.conversation_id = conversations.id
      )
      group by conversations.id
    `);

    if (conversations.rowCount) {
      return this.find(conversations.rows[0].id);
    }

    return Conversation.create(participants);
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

        const participant = await User.find(userId);

        const conversation = await Conversation.findOrCreate([
          user,
          participant
        ]);

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
