import { combineResolvers } from 'graphql-resolvers';
import auth                 from '../middlewares/auth';
import Conversation         from '../../models/conversation';
import { registerQuery }    from '../registry';

const def = 'conversations: [Conversation]';

const conversations = async (_, __, { user }) => {
  return Conversation.findUserConversations(user);
};

registerQuery(def, {
  conversations: combineResolvers(auth, conversations)
});
