import { combineResolvers }     from 'graphql-resolvers';
import auth                     from '../middlewares/auth';
import { registerSubscription } from '../registry';
import pubsub, { conversationStartedMissionActivityTopic } from '../../services/graphql/pubsub';

const def = 'startedMission: Mission';

const startedMission = {
  subscribe: combineResolvers(auth, (_, __, { user }) => {
    return pubsub.asyncIterator(conversationStartedMissionActivityTopic(user.id));
  })
};

registerSubscription(def, { startedMission });
