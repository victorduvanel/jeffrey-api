import User              from '../../models/user';
import Conversation      from '../../models/conversation';
import { NotFound }      from '../../errors';
import { registerQuery } from '../registry';

const def = 'conversation(userId: ID!): Conversation';

const conversation = async (_, { userId }, { user }) => {
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
};

registerQuery(def, { conversation });
