import { combineResolvers } from 'graphql-resolvers';
import auth                 from '../middlewares/auth';
import { registerMutation } from '../registry';
import Conversation         from '../../models/conversation';
import Message              from '../../models/message';

export const def = 'newMessage(conversationId: String!, message: String!): Message';

export const newMessage = async (_, { conversationId, message: body }, { user }) => {
  try {
    const conversation = await Conversation.find(conversationId);
    if (!conversation) {
      throw new Error('conversation not found');
    }

    await conversation.load(['participants']);

    const message = await Message.create({ from: user, body, conversation });
    await conversation.notifyParticipants(message);

    return message;
  } catch (err) {
    console.error(err);
  }
};

registerMutation(def, {
  newMessage: combineResolvers(
    auth,
    newMessage
  )
});
