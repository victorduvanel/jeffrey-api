import _ from 'lodash';
import 'babel-polyfill';
import './services/google/datastore';

import chalk                           from 'chalk';
import http                            from 'http';
import express                         from 'express';
import Promise                         from 'bluebird';

import { ApolloEngine }                from 'apollo-engine';

import config                          from './config';
import routes                          from './routes';

import { subscriptionServer }          from './services/graphql';

import logger                          from './middlewares/logger';
import corsPolicy                      from './middlewares/cors-policy';
import notFound                        from './middlewares/not-found';
import errorHandler                    from './middlewares/error-handler';
import { router, get, post }           from './middlewares/router';
import graphqlRoute                    from './routes/graphql';

import './graphql/types';
import './graphql/mutations';
import './graphql/subscriptions';
import './graphql/queries';

import locales                         from './locales';
import { loadLocale }                  from './lib/i18n';

_.forEach(locales, (messages, locale) => {
  loadLocale(locale, messages);
});

export const httpServer = http.createServer();

const app = express();

app.disable('x-powered-by');
if (config.PRODUCTION) {
  app.enable('trust proxy');
}

app.use(logger, corsPolicy, router, notFound, errorHandler);

httpServer.on('request', app);

subscriptionServer(httpServer);

// ROUTES
get('/', async (req, res) => {
  res.send({
    hello: 'world'
  });
});

get('/info', routes.info.get);

post('/process-payout', routes.processPayout.post);
post('/payout-alert', routes.payoutAlert.post);

post('/cron', routes.cron.post);

router.use('/graphql', ...(graphqlRoute()));
get('/graphiql', routes.graphiql.get);

post('/ping', routes.ping.post);

post('/signup', routes.signup.post);

get('/me', routes.me.get);
post('/me', routes.me.post);

post('/logout', routes.logout.post);

post('/oauth/token', routes.oauth.token.post);
post('/oauth/revoke', routes.oauth.revoke.post);
post('/oauth/single-use-token', routes.oauth.singleUseToken.post);

post('/payment-methods', routes.paymentMethods.post);
get('/payment-methods', routes.paymentMethods.get);

post('/contact-details', routes.contactDetails.post);

get('/messages', routes.messages.get);
post('/messages', routes.messages.post);

post('/reset-password', routes.resetPassword.post);
get('/reset-password/:token', routes.resetPassword.get);

get('/ms', routes.ms.get);
get('/fixture/messages', routes.fixtureMessages.get);
post('/apple/ios-receipt', routes.apple.iosReceipt.post);
get('/app-link', routes.appLink.get);
get('/app-redirect/:action', routes.appRedirect.get);
post('/profile-pic', routes.profilePic.post);
post('/user-documents', routes.userDocuments.post);
post('/user-device', routes.userDevice.post);

post('/phone-number', routes.phoneNumber.post);
post('/phone-number/verify', routes.phoneNumber.verify.post);

post('/tos', routes.tos.post);
post('/bank-accounts', routes.bankAccounts.post);
post('/providers', routes.providers.post);

post('/stripe/webhook', routes.stripe.webhook.post);

get('/pay', routes.pay.get);

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
