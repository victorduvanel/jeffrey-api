import Promise      from 'bluebird';
import uuid         from 'uuid';
import { NotFound } from '../errors';
import bookshelf    from '../services/bookshelf';
import Base         from './base';
import User         from './user';
import Mission      from './mission';
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
    const payload = message.serialize();

    participants.forEach(user => {
      pubsub.publish(
        `${CONVERSATION_ACTIVITY_TOPIC}.${user.get('id')}`,
        {
          newMessage: payload
        }
      );

      user.sendMessage({
        body: 'New message'
      });
    });
  }
}, {
  create: async function(participants) {
    const { knex } = bookshelf;
    const id = uuid.v4();
    const participantIds = [];

    participants.forEach((participant) => {
      const id = participant.get('id');
      if (participantIds.indexOf(id) === -1) {
        participantIds.push(id);
      }
    });

    await knex.transaction(async (t) => {
      await knex('conversations')
        .insert({
          id,
          created_at: knex.raw('NOW()'),
          updated_at: knex.raw('NOW()'),
        });
      await Promise.map(participantIds, async (participantId) => (
        knex('conversation_participants').transacting(t).insert({
          conversation_id: id,
          user_id: participantId
        })
      ));
    });

    return this.find(id);
  },

  findOrCreate: async function(participants) {
    const participantIds = [];

    participants.forEach((participant) => {
      const id = `'${participant.get('id')}'`;
      if (participantIds.indexOf(id) === -1) {
        participantIds.push(id);
      }
    });

    /**
     * We basically need to find the conversation that matches exactly the
     * those participants
     */
    const conversations = await bookshelf.knex.raw(`
      select conversations.id
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
        missions: [Mission]
      }
    `;
  },

  resolver: {
    Query: {
      conversation: async (_, { userId }, { user } /*, params */) => {
        if (!user) {
          throw new Error('this resource requires authentication');
        }

        const participant = await User.find(userId);
        if (!participant) {
          throw new Error('participant not found');
        }

        if (user.get('id') === participant.get('id')) {
          throw new Error('Invalid participant id');
        }

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
      participants: async({ id }) => {
        const conversation = await Conversation.find(id);
        if (!conversation) {
          throw new Error('conversation not found');
        }
        await conversation.load(['participants']);
        const participants = conversation.related('participants').toArray();
        return await Promise.all(participants.map(p => p.serialize()));
      },

      messages: async({ id }) => {
        const conversation = await Conversation.find(id);

        await conversation.load([{
          messages: query => query.orderBy('created_at', 'desc')
        }]);

        return conversation.related('messages').invokeMap('serialize');
      },

      missions: async ({ id }) => {
        const conversation = await Conversation.find(id);
        if (!conversation) {
          return null;
        }

        await conversation.load(['participants']);

        const participantIds = conversation.related('participants')
          .map(participant => participant.get('id'));

        const missions = await Mission
          .query((qb) => {
            qb.whereIn('provider_id', participantIds);
            qb.whereIn('client_id', participantIds);
          })
          .fetchAll();

        return missions.map(mission => mission.serialize());
      }
    }
  }
});

export default bookshelf.model('Conversation', Conversation);
