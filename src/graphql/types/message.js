import Message          from '../../models/message';
import { registerType } from '../registry';

const def = `
type Message {
  id: String!
  message: String!
  from: User!
  createdAt: Date!
  conversation: Conversation!
}
`;

const resolver = {
  Message: {
    conversation: async({ id }) => {
      const message = await Message.find(id);
      if (!message) {
        return null;
      }

      await message.load(['conversation']);
      const conversation = message.related('conversation');
      if (!conversation) {
        return null;
      }

      return conversation.serialize();
    },

    from: async({ id }) => {
      const message = await Message.find(id);
      await message.load(['from']);
      const from = message.related('from');
      return {
        id: from.get('id'),
        profilePicture: from.get('profilePicture')
      };
    }
  }
};

registerType(def, resolver);
