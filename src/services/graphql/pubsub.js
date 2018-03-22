import { RedisPubSub } from 'graphql-redis-subscriptions';
import config  from '../../config';

const pubsub = new RedisPubSub({
  connection: {
    ...config.redis
  }
});

export const CONVERSATION_ACTIVITY_TOPIC = 'CONVERSATION_ACTIVITY_TOPIC';

export default pubsub;
