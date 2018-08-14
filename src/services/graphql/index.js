import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import AccessToken            from '../../models/access-token';
import getSchema              from '../../graphql/schema';

export const subscriptionServer = (websocketServer) => {
  const schema = getSchema();

  return SubscriptionServer.create({
    schema,
    execute,
    subscribe,
    onConnect: async ({ token, locale }, socket) => {
      if (!token) {
        socket.close();
        return;
      }

      try {
        if (token) {
          const accessToken = await AccessToken.find(token);
          if (accessToken) {
            const user = accessToken.related('user');
            const req = socket.upgradeReq;
            return {
              req,
              user,
              locale
            };
          }
        }
      } catch (err) {
        console.error(err);
        return {};
      }
    }
  }, {
    server: websocketServer,
    path: '/graphql',
  });
};
