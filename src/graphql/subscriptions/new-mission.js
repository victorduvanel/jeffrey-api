import { combineResolvers }                    from 'graphql-resolvers';
import auth                                    from '../middlewares/auth';
import Mission                                 from '../../models/mission';
import { registerSubscription }                from '../registry';
import pubsub, { conversationNewMissionActivityTopic } from '../../services/graphql/pubsub';

const def = 'newMission: Mission';

const newMission = {
  resolve: (payload /*, args, context, info */) => {
    return Mission.find(payload.newMission);
  },
  subscribe: combineResolvers(auth, (_, __, { user }) => {
    return pubsub.asyncIterator(conversationNewMissionActivityTopic(user.id));
  })
};

registerSubscription(def, { newMission });
