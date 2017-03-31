import url            from 'url';
import querystring    from 'querystring';
import WebSocket      from 'ws';

import AccessToken    from '../models/access-token';
import redis          from '../services/redis';
import ChannelFactory from '../services/redis/channel-factory';

const CHANNEL_PREFIX = '__notifications__';

const channelNameForUser = (user) => {
  return `${CHANNEL_PREFIX}:${user.get('id')}`;
};

export default async (httpServer) => {
  const server = new WebSocket.Server({ server: httpServer });

  server.on('connection', async (ws) => {
    const req = ws.upgradeReq;

    const qs = querystring.parse(url.parse(req.url).query);

    const token = qs.access_token;

    if (!token) {
      ws.close();
      return;
    }

    const accessToken = await AccessToken.find(token);
    if (!accessToken) {
      ws.close();
      return;
    }

    const user = accessToken.related('user');

    const channel = await ChannelFactory.instance
      .createChannel(channelNameForUser(user));

    const onMessage = (message) => {
      ws.send(message);
    };

    channel.on('message', onMessage);

    ws.on('close', () => {
      channel.release();
      channel.removeListener('message', onMessage);
    });

    user.sendMessage(`bonjour ${user.get('firstName')}`);
  });
};

export const send = (user, message) => {
  redis.pub.publish(channelNameForUser(user), message);
};
