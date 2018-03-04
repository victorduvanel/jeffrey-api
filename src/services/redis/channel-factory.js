import Channel, { channels } from './channel';

let _instance;

export default class ChannelFactory {
  static get instance() {
    if (!_instance) {
      _instance = new ChannelFactory();
    }
    return _instance;
  }

  async createChannel(name) {
    if (channels.hasOwnProperty(name)) {
      const channel = channels[name];
      channel.addRef();
      return channel;
    }

    const channel = new Channel(name);
    await channel.subscribe();
    channel.addRef();
    return channel;
  }
}
