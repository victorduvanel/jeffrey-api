import { combineResolvers }               from 'graphql-resolvers';
import auth                               from '../middlewares/auth';
import Mission                            from '../../models/mission';
import { registerSubscription }           from '../registry';
import pubsub, { newMissionRequestTopic } from '../../services/graphql/pubsub';

const def = 'missionRequest: Mission';

const missionRequest = {
  resolve: (payload /*, args, context, info */) => {
    return Mission.find(payload.missionRequest);
  },
  subscribe: combineResolvers(auth, (_, __, { user }) => {
    return pubsub.asyncIterator(newMissionRequestTopic(user.id));
  })
};

registerSubscription(def, { missionRequest });
