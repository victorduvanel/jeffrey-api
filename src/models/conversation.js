import Promise   from 'bluebird';
import uuid      from 'uuid';
import bookshelf from '../services/bookshelf';
import knex      from '../services/knex';
import Base      from './base';
import pubsub, { conversationNewMessageActivityTopic } from '../services/graphql/pubsub';

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
    await message.load(['from']);

    const participants = this.related('participants');
    const from = message.related('from');
    const firstName = from.get('firstName');

    participants.forEach(user => {
      pubsub.publish(
        conversationNewMessageActivityTopic(user.get('id')),
        {
          newMessage: message.get('id')
        }
      );

      user.sendMessage({
        body: firstName ? `${firstName} sent you a message` : 'New message'
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

  findUserConversations: function(user) {
    return Conversation
      .query((qb) => {
        qb.whereIn(
          'id',
          knex('conversation_participants')
            .select('conversation_id')
            .where('user_id', user.get('id'))
        );
      })
      .fetchAll();
  }
});

export default bookshelf.model('Conversation', Conversation);
