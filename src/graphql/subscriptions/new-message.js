import { combineResolvers }     from 'graphql-resolvers';
import auth                     from '../middlewares/auth';
import Message                  from '../../models/message';
import { registerSubscription } from '../registry';
import pubsub, { conversationNewMessageActivityTopic } from '../../services/graphql/pubsub';

const def = 'newMessage: Message';

const newMessage = {
  resolve: (payload /*, args, context, info */) => {
    return Message.find(payload.newMessage);
  },
  subscribe: combineResolvers(auth, (_, __, { user }) => {
    return pubsub.asyncIterator(conversationNewMessageActivityTopic(user.id));
  })
};

registerSubscription(def, { newMessage });
