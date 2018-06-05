import { RedisPubSub } from 'graphql-redis-subscriptions';
import config  from '../../config';

const pubsub = new RedisPubSub({
  connection: {
    ...config.redis
  }
});

const CONVERSATION_NEW_MISSION_ACTIVITY_TOPIC = 'CONVERSATION_NEW_MISSION_ACTIVITY_TOPIC';
export const conversationNewMissionActivityTopic = (conversationId, userId) => {
  return `${CONVERSATION_NEW_MISSION_ACTIVITY_TOPIC}.${conversationId}.${userId}`;
};

const CONVERSATION_NEW_MESSAGE_ACTIVITY_TOPIC = 'CONVERSATION_NEW_MESSAGE_ACTIVITY_TOPIC';
export const conversationNewMessageActivityTopic = (conversationId, userId) => {
  return `${CONVERSATION_NEW_MESSAGE_ACTIVITY_TOPIC}.${conversationId}.${userId}`;
};

export default pubsub;
