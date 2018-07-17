import { combineResolvers } from 'graphql-resolvers';
import auth                 from '../middlewares/auth';
import User                 from '../../models/user';
import Conversation         from '../../models/conversation';
import { NotFound }         from '../../errors';
import { registerQuery }    from '../registry';

const def = 'conversation(userId: ID!): Conversation';

const conversation = async (_, { userId }, { user }) => {
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

  return conversation;
};

registerQuery(def, {
  conversation: combineResolvers(auth, conversation)
});
