import { combineResolvers }                    from 'graphql-resolvers';
import auth                                    from '../middlewares/auth';
import { registerSubscription }                from '../registry';
import pubsub, { conversationNewMissionActivityTopic } from '../../services/graphql/pubsub';

const def = 'newMission(conversationId: String!): Mission';

const newMission = {
  subscribe: combineResolvers(auth, (_, { conversationId }, { user }) => {
    return pubsub.asyncIterator(conversationNewMissionActivityTopic(conversationId, user.get('id')));
  })
};

registerSubscription(def, { newMission });
