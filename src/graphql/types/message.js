import Message          from '../../models/message';
import { registerType } from '../registry';

const def = `
type Message {
  id: String!
  message: String!
  from: User!
  createdAt: Date!
}
`;

const resolver = {
  Message: {
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
