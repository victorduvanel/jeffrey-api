import { registerType } from '../registry';
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
    participants: async(conversation, _, { user }) => {
      await conversation.load(['participants']);
      return conversation.related('participants').filter((participant) => {
        return participant.get('id') !== user.id;
      });
    },

    messages: async(conversation) => {
      await conversation.load([{
        messages: query => query.orderBy('created_at', 'desc')
      }]);
      return conversation.related('messages').toArray();
    },

    missions: async (conversation) => {
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
