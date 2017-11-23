import 'regenerator-runtime/runtime';

import chalk                             from 'chalk';
import http                              from 'http';
import express                           from 'express';
import Promise                           from 'bluebird';

import config                            from './config';
import routes                            from './routes';

import graphql                           from './graphql';
import graphiql                          from './graphiql';

import logger                            from './middlewares/logger';
import corsPolicy                        from './middlewares/cors-policy';
import notFound                          from './middlewares/not-found';
import errorHandler                      from './middlewares/error-handler';
import { router, get, post, patch, del } from './middlewares/router';
import notificationService               from './services/notification';

export const httpServer = http.createServer();
const app = express();

app.disable('x-powered-by');
if (config.PRODUCTION) {
  app.enable('trust proxy');
}

app.use(logger, corsPolicy, router, notFound, errorHandler);

notificationService(httpServer);

httpServer.on('request', app);

router.use('/graphql', ...graphql);
router.use('/graphiql', ...graphiql);

// ROUTES
get('/', (req, res) => {
  res.send({ hello: 'world' });
});
post('/webhook', routes.webhook.post);

post('/signup', routes.signup.post);
post('/activate/:code', routes.activate.post);

get('/me', routes.me.get);
patch('/me', routes.me.patch);

post('/oauth/token', routes.oauth.token.post);
post('/oauth/revoke', routes.oauth.revoke.post);
post('/oauth/single-use-token', routes.oauth.singleUseToken.post);

post('/northsigner/token', routes.northsigner.token.post);
post('/northsigner/register', routes.northsigner.register.post);

post('/payment-methods', routes.paymentMethods.post);
get('/payment-methods', routes.paymentMethods.get);

get('/phone-numbers', routes.phoneNumber.get);
get('/phone-numbers/:phone_number_id', routes.phoneNumber.getOne);
del('/phone-numbers/:phone_number_id', routes.phoneNumber.destroy);
post('/phone-numbers', routes.phoneNumber.post);

get('/messages', routes.messages.get);
post('/messages', routes.messages.post);

get('/invoices', routes.invoices.get);
get('/invoices/:invoice_id', routes.invoices.getOne);

get('/terms', routes.terms.get);

post('/reset-password', routes.resetPassword.post);
get('/reset-password/:token', routes.resetPassword.get);

post('/twilio/token', routes.twilio.token.post);
post('/twilio/hook', routes.twilio.hook.post);
post('/twilio/access-token', routes.twilio.accessToken.post);
get('/twilio/access-token', routes.twilio.accessToken.get);
post('/twilio/webhook', routes.twilio.webhook.post);
post('/twilio/incoming', routes.twilio.incoming.post);
get('/twilio/incoming', routes.twilio.incoming.get);

get('/placeCall', routes.twilio.placeCall.get);

post('/web-notification', routes.webNotification.post);

get('/conversations', routes.conversations.get);
post('/conversations', routes.conversations.post);
get('/conversations/:conversation_id', routes.conversations.getOne);

get('/ms', routes.ms.get);

get('/fixture/messages', routes.fixtureMessages.get);

post('/apple/ios-receipt', routes.apple.iosReceipt.post);

get('/app-link', routes.appLink.get);

get('/app-redirect/:action', routes.appRedirect.get);

let _listenProm = null;
export const listen = () => {
  if (!_listenProm) {
    _listenProm = new Promise((resolve) => {
      httpServer.listen(config.port, () => {
        const addr = httpServer.address();

        /* eslint-disable no-console */
        if (addr.family === 'IPv6') {
          console.info(chalk.green(`Serving at http://[${addr.address}]:${addr.port}`));
        } else {
          console.info(chalk.green(`Serving at http://${addr.address}:${addr.port}`));
        }
        /* eslint-enable no-console */

        const wait = () => {
          return new Promise((resolve) => {
            httpServer.on('close', resolve);
          });
        };

        resolve(Object.assign(addr, { wait }));
      });
    });
  }

  return _listenProm;
};
