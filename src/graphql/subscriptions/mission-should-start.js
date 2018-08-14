import { combineResolvers }                        from 'graphql-resolvers';
import auth                                        from '../middlewares/auth';
import Mission                                     from '../../models/mission';
import { registerSubscription }                    from '../registry';
import pubsub, { missionShouldStartActivityTopic } from '../../services/graphql/pubsub';

const def = 'missionShouldStart: Mission';

const missionShouldStart = {
  resolve: (payload /*, args, context, info */) => {
    return Mission.find(payload.missionShouldStart);
  },
  subscribe: combineResolvers(auth, (_, __, { user }) => {
    return pubsub.asyncIterator(missionShouldStartActivityTopic(user.id));
  })
};

registerSubscription(def, { missionShouldStart });
