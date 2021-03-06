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

const CONVERSATION_MISSION_STATUS_CHANGED_ACTIVITY_TOPIC = 'CONVERSATION_MISSION_STATUS_CHANGED_ACTIVITY_TOPIC';
export const conversationMissionStatusChangedActivityTopic = (userId) => {
  return `${CONVERSATION_MISSION_STATUS_CHANGED_ACTIVITY_TOPIC}.${userId}`;
};

const CONVERSATION_STARTED_MISSION_ACTIVITY_TOPIC = 'CONVERSATION_STARTED_MISSION_ACTIVITY_TOPIC';
export const conversationStartedMissionActivityTopic = (userId) => {
  return `${CONVERSATION_STARTED_MISSION_ACTIVITY_TOPIC}.${userId}`;
};

const CONVERSATION_ENDED_MISSION_ACTIVITY_TOPIC = 'CONVERSATION_ENDED_MISSION_ACTIVITY_TOPIC';
export const conversationEndedMissionActivityTopic = (userId) => {
  return `${CONVERSATION_ENDED_MISSION_ACTIVITY_TOPIC}.${userId}`;
};

const CONVERSATION_NEW_MESSAGE_ACTIVITY_TOPIC = 'CONVERSATION_NEW_MESSAGE_ACTIVITY_TOPIC';
export const conversationNewMessageActivityTopic = (userId) => {
  return `${CONVERSATION_NEW_MESSAGE_ACTIVITY_TOPIC}.${userId}`;
};

const MISSION_SHOULD_START_ACTIVITY_TOPIC = 'MISSION_SHOULD_START_ACTIVITY_TOPIC';
export const missionShouldStartActivityTopic = (userId) => {
  return `${MISSION_SHOULD_START_ACTIVITY_TOPIC}.${userId}`;
};

const NEW_MISSION_REQUEST_TOPIC = 'NEW_MISSION_REQUEST_TOPIC';
export const newMissionRequestTopic = (userId) => {
  return `${NEW_MISSION_REQUEST_TOPIC }.${userId}`;
};

export default pubsub;
