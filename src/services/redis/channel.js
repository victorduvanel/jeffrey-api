import Promise      from 'bluebird';
import EventEmitter from 'events';
import redis        from './index.js';

export const channels = {};

/* eslint-disable no-console */
export default class Channel extends EventEmitter {
  constructor(name) {
    super();
    this.name = name;
    this.ref = 0;
  }

  _subscribed() {
    if (!this.subscriptionResolver) {
      console.error(`No subscription resolve for the channel: ${this.name}`);
      return;
    }

    const resolver = this.subscriptionResolver;
    delete this.subscriptionResolver;
    resolver();
  }

  subscribe() {
    if (channels.hasOwnProperty(this.name)) {
      return Promise.reject(
        new Error('A subscription for this channel is pending')
      );
    }

    channels[this.name] = this;

    const rt = new Promise((resolve) => {
      this.subscriptionResolver = resolve;
    });

    redis.sub.subscribe(this.name);
    return rt;
  }

  _messageReceived(message) {
    this.emit('message', message);
  }

  addRef() {
    this.ref += 1;
  }

  release() {
    this.ref -= 1;

    if (this.ref === 0) {
      this.removeAllListeners();
      redis.sub.unsubscribe(this.name);
      delete channels[this.name];
    }
  }
}

redis.sub.on('subscribe', (channelName) => {
  if (!channels.hasOwnProperty(channelName)) {
    console.error(
      `A subscribe event for an unknow channel as been received: ${channelName}`
    );
    if (channelName) {
      redis.sub.unsubscribe(channelName);
    }
    return;
  }

  channels[channelName]._subscribed();
});

redis.sub.on('message', (channelName, message) => {
  if (!channels.hasOwnProperty(channelName)) {
    console.error(
      `A message event for an unknow channel as been received: ${channelName}`
    );
    if (channelName) {
      redis.sub.unsubscribe(channelName);
    }
    return;
  }

  channels[channelName]._messageReceived(message);
});
/* eslint-enable no-console */
