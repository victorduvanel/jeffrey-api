import { combineResolvers }     from 'graphql-resolvers';
import auth                     from '../middlewares/auth';
import Mission                  from '../../models/mission';
import { registerSubscription } from '../registry';
import pubsub, { conversationEndedMissionActivityTopic } from '../../services/graphql/pubsub';

const def = 'endedMission: Mission';

const endedMission = {
  resolve: (payload /*, args, context, info */) => {
    return Mission.find(payload.endedMission);
  },
  subscribe: combineResolvers(auth, (_, __, { user }) => {
    return pubsub.asyncIterator(conversationEndedMissionActivityTopic(user.id));
  })
};

registerSubscription(def, { endedMission });
