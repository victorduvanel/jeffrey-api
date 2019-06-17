import _ from 'lodash';
import 'babel-polyfill';

import chalk from 'chalk';
import http from 'http';
import express from 'express';
import Promise from 'bluebird';

import { ApolloEngine } from 'apollo-engine';

import config from './config';
import routes from './routes';

import { subscriptionServer } from './services/graphql';

import logger from './middlewares/logger';
import i18n from './middlewares/i18n';
import corsPolicy from './middlewares/cors-policy';
import notFound from './middlewares/not-found';
import errorHandler from './middlewares/error-handler';
import rateLimiter from './middlewares/rate-limiter';
import { router, get, post } from './middlewares/router';
import graphqServer, { middlewares as graphqlMiddlewares } from './routes/graphql';

import './graphql/types';
import './graphql/mutations';
import './graphql/subscriptions';
import './graphql/queries';

import locales from './locales';
import { loadLocale } from './lib/i18n';

_.forEach(locales, (messages, locale) => {
  loadLocale(locale, messages);
});

export const httpServer = http.createServer();

const app = express();

app.disable('x-powered-by');
if (config.PRODUCTION) {
  app.enable('trust proxy');
}

app.use(
  logger,
  corsPolicy,
  i18n,
  rateLimiter,
  router,
  notFound,
  errorHandler
);

httpServer.on('request', app);

subscriptionServer(httpServer);

// ROUTES
post('/notify/message', routes.notify.message.post);
post('/notify/unread-conversations', routes.notify.unreadConversations.post);

get('/info', routes.info.get);

post('/process-payout', routes.processPayout.post);
post('/payout-alert', routes.payoutAlert.post);

post('/cron', routes.cron.post);

get('/me', routes.me.get);
post('/me', routes.me.post);

post('/logout', routes.logout.post);

post('/login', routes.login.post);

post('/oauth/token', routes.oauth.token.post);
post('/oauth/revoke', routes.oauth.revoke.post);

post('/payment-methods', routes.paymentMethods.post);
get('/payment-methods', routes.paymentMethods.get);

post('/contact-details', routes.contactDetails.post);

post('/profile-pic', routes.profilePic.post);
post('/user-documents', routes.userDocuments.post);
post('/user-device', routes.userDevice.post);

post('/phone-number', routes.phoneNumber.post);
post('/phone-number/verify', routes.phoneNumber.verify.post);

post('/stripe/webhook', routes.stripe.webhook.post);

post('/newsletter-subscribe', routes.newsletterSubscribe.post);
post('/support-message', routes.supportMessage.post);

get('/invoice/:missionId', routes.invoice.get);

router.use('/graphql', ...graphqlMiddlewares);
graphqServer().applyMiddleware({
  app: router,
  path: '/graphql'
});

let _listenProm = null;
export const listen = () => {
  if (!_listenProm) {
    _listenProm = new Promise((resolve) => {
      const port = process.env.PORT || 3000;

      const engine = new ApolloEngine({
        apiKey: config.apolloEngine.apiKey
      });

      const listenCb = () => {
        const addr = httpServer.address();
        let uri = '';

        if (addr.family === 'IPv6') {
          uri = `http://[${addr.address}]:${addr.port}`;
        } else {
          uri = `http://${addr.address}:${addr.port}`;
        }

        /* eslint-disable no-console */
        console.info(chalk.green(`[${process.pid}] Serving at ${uri}`));
        /* eslint-enable no-console */

        const wait = () => {
          return new Promise((resolve) => {
            httpServer.on('close', resolve);
          });
        };

        resolve(Object.assign(addr, { wait }));
      };

      if (config.PRODUCTION) {
        engine.listen({
          port,
          httpServer,
          originUrl: `${config.webappProtocol}://${config.webappHost}`
        }, listenCb);
      } else {
        httpServer.listen({ port }, listenCb);
      }
    });
  }

  return _listenProm;
};
