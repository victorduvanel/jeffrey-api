import { combineResolvers }                            from 'graphql-resolvers';
import auth                                            from '../middlewares/auth';
import { registerSubscription }                        from '../registry';
import pubsub, { conversationMissionStatusChangedActivityTopic } from '../../services/graphql/pubsub';

const def = 'missionStatus: Mission';

const missionStatus = {
  subscribe: combineResolvers(auth, (_, __, { user }) => {
    return pubsub.asyncIterator(conversationMissionStatusChangedActivityTopic(user.id));
  })
};

registerSubscription(def, { missionStatus });
