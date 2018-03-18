import { RedisPubSub } from 'graphql-redis-subscriptions';

const pubsub = new RedisPubSub();

export const CONVERSATION_ACTIVITY_TOPIC = 'CONVERSATION_ACTIVITY_TOPIC';

export default pubsub;
