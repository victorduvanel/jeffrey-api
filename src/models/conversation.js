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

  /* GRAPHQL PROPS */
  unseenActivity(_, { user }) {
    return this.lastUnseenActivities && !!this.lastUnseenActivities[user.get('id')];
  },
  /* !GRAPHQL PROPS */

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
  },

  setLastUnseenActivityForUser(lastUnseenActivity, user) {
    this.lastUnseenActivities = this.lastUnseenActivities || {};
    this.lastUnseenActivities[user.get('id')] = lastUnseenActivity;
  },

  getLastUnseenActivityForUser(user) {
    return this.lastUnseenActivities && this.lastUnseenActivities[user.get('id')];
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
     * We basically need to find the conversation that matches exactly
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

  findUserConversations: async function(user) {
    const res = await knex('conversation_participants')
      .select('conversations.*', 'conversation_participants.last_unseen_activity_at')
      .where('conversation_participants.user_id', user.get('id'))
      .join('conversations', 'conversations.id', 'conversation_participants.conversation_id')
      .orderBy('conversation_participants.last_activity_at', 'DESC');

    return res.map(({ last_unseen_activity_at: lastUnseenActivityAt, ...attrs }) => {
      const conversation = Conversation.forge(attrs);
      if (lastUnseenActivityAt) {
        conversation.setLastUnseenActivityForUser(lastUnseenActivityAt, user);
      }
      return conversation;
    });
  }
});

export default bookshelf.model('Conversation', Conversation);
