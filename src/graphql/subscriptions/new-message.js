import { combineResolvers }     from 'graphql-resolvers';
import auth                     from '../middlewares/auth';
import { registerSubscription } from '../registry';
import pubsub, { CONVERSATION_ACTIVITY_TOPIC } from '../../services/graphql/pubsub';

const def = 'newMessage(conversationId: String!): Message';

const newMessage = {
  subscribe: combineResolvers(auth, (_, __ /* { conversationId } */, { user }) => {
    return pubsub.asyncIterator(`${CONVERSATION_ACTIVITY_TOPIC}.${user.get('id')}`);
  })
};

registerSubscription(def, { newMessage });
