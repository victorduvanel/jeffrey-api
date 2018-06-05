import { RedisPubSub } from 'graphql-redis-subscriptions';
import config  from '../../config';

const pubsub = new RedisPubSub({
  connection: {
    ...config.redis
  }
});

const CONVERSATION_NEW_MISSION_ACTIVITY_TOPIC = 'CONVERSATION_NEW_MISSION_ACTIVITY_TOPIC';
export const conversationNewMissionActivityTopic = (userId) => {
  return `${CONVERSATION_NEW_MISSION_ACTIVITY_TOPIC}.${userId}`;
};

const CONVERSATION_NEW_MESSAGE_ACTIVITY_TOPIC = 'CONVERSATION_NEW_MESSAGE_ACTIVITY_TOPIC';
export const conversationNewMessageActivityTopic = (userId) => {
  return `${CONVERSATION_NEW_MESSAGE_ACTIVITY_TOPIC}.${userId}`;
};

export default pubsub;
