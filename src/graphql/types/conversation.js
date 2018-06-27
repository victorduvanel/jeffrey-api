import { registerType } from '../registry';
import Conversation     from '../../models/conversation';
import Mission          from '../../models/mission';

const def = `
type Conversation {
  id: String!
  participants: [User]!
  messages: [Message]!
  missions: [Mission]
}
`;

const resolver = {
  Conversation: {
    participants: async({ id }) => {
      const conversation = await Conversation.find(id);
      if (!conversation) {
        throw new Error('conversation not found');
      }
      await conversation.load(['participants']);
      const participants = conversation.related('participants').toArray();
      return await Promise.all(participants.map(participant => participant.serialize()));
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

      return missions.toArray();
    }
  }
};

registerType(def, resolver);
