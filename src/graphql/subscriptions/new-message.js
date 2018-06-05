import { combineResolvers }     from 'graphql-resolvers';
import auth                     from '../middlewares/auth';
import { registerSubscription } from '../registry';
import pubsub, { conversationNewMessageActivityTopic } from '../../services/graphql/pubsub';

const def = 'newMessage(conversationId: String!): Message';

const newMessage = {
  subscribe: combineResolvers(auth, (_, __, { user }) => {
    return pubsub.asyncIterator(conversationNewMessageActivityTopic(user.id));
  })
};

registerSubscription(def, { newMessage });
