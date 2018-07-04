import { combineResolvers }     from 'graphql-resolvers';
import auth                     from '../middlewares/auth';
import Mission                  from '../../models/mission';
import { registerSubscription } from '../registry';
import pubsub, { conversationStartedMissionActivityTopic } from '../../services/graphql/pubsub';

const def = 'startedMission: Mission';

const startedMission = {
  resolve: (payload /*, args, context, info */) => {
    return Mission.find(payload.startedMission);
  },
  subscribe: combineResolvers(auth, (_, __, { user }) => {
    return pubsub.asyncIterator(conversationStartedMissionActivityTopic(user.id));
  })
};

registerSubscription(def, { startedMission });
