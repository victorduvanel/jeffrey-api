import { combineResolvers }     from 'graphql-resolvers';
import auth                     from '../middlewares/auth';
import Mission                  from '../../models/mission';
import { registerSubscription } from '../registry';
import pubsub                   from '../../services/graphql/pubsub';

const def = 'missionRequest: Mission';

const missionRequest = {
  resolve: (payload /*, args, context, info */) => {
    return Mission.find(payload.missionRequest);
  },
  subscribe: combineResolvers(auth, (_, __, { user }) => {
    console.log('subscribe');
    return pubsub.asyncIterator(/* user.id */ 'toto');
  })
};

registerSubscription(def, { missionRequest });
