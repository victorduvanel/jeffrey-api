import { combineResolvers } from 'graphql-resolvers';
import auth                 from '../middlewares/auth';
import knex                 from '../../services/knex';
import { registerMutation } from '../registry';

const def = 'conversationSeen(conversationId: ID!, when: Date!): Boolean';

const conversationSeen = async (_, { conversationId, when }, { user }) => {
  await knex('conversation_participants')
    .update({
      last_unseen_activity_at: null
    })
    .where('user_id', user.get('id'))
    .where('conversation_id', '=', conversationId)
    .where('last_unseen_activity_at', '<=', when);
  return true;
};

registerMutation(def, {
  conversationSeen: combineResolvers(auth, conversationSeen)
});
