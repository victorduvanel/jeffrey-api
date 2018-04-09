import 'regenerator-runtime/runtime';

import './services/google/datastore';

import chalk                           from 'chalk';
import http                            from 'http';
import express                         from 'express';
import Promise                         from 'bluebird';

import config                          from './config';
import routes                          from './routes';

import graphql, { subscriptionServer } from './services/graphql';

import logger                          from './middlewares/logger';
import corsPolicy                      from './middlewares/cors-policy';
import notFound                        from './middlewares/not-found';
import errorHandler                    from './middlewares/error-handler';
import { router, get, post }           from './middlewares/router';

import User from './models/user';

export const httpServer = http.createServer();
const app = express();

app.disable('x-powered-by');
if (config.PRODUCTION) {
  app.enable('trust proxy');
}

app.use(logger, corsPolicy, router, notFound, errorHandler);

//notificationService(httpServer);

httpServer.on('request', app);

subscriptionServer(httpServer);

router.use('/graphql', ...graphql);
get('/graphiql', routes.graphiql.get);

// ROUTES
get('/', async (req, res) => {
  const user = await User
    .forge({ email: 'wr.wllm@gmail.com' })
    .fetch();

  await user.pushNotification({
    body: 'Salut!!!!'
  });

  res.send({ hello: 'world' });
});
// post('/webhook', routes.webhook.post);

post('/ping', routes.ping.post);

post('/signup', routes.signup.post);
post('/activate/:code', routes.activate.post);

get('/me', routes.me.get);
post('/me', routes.me.post);

post('/oauth/token', routes.oauth.token.post);
post('/oauth/revoke', routes.oauth.revoke.post);
post('/oauth/single-use-token', routes.oauth.singleUseToken.post);

post('/payment-methods', routes.paymentMethods.post);
get('/payment-methods', routes.paymentMethods.get);

post('/contact-details', routes.contactDetails.post);

get('/messages', routes.messages.get);
post('/messages', routes.messages.post);

get('/invoices', routes.invoices.get);
get('/invoices/:invoice_id', routes.invoices.getOne);

post('/reset-password', routes.resetPassword.post);
get('/reset-password/:token', routes.resetPassword.get);

get('/ms', routes.ms.get);
get('/fixture/messages', routes.fixtureMessages.get);
post('/apple/ios-receipt', routes.apple.iosReceipt.post);
get('/app-link/*', routes.appLink.get);
get('/app-redirect/:action', routes.appRedirect.get);
post('/profile-pic', routes.profilePic.post);
post('/user-documents', routes.userDocuments.post);
post('/user-device', routes.userDevice.post);

let _listenProm = null;
export const listen = () => {
  if (!_listenProm) {
    _listenProm = new Promise((resolve) => {

      const port = process.env.PORT || 3000;

      httpServer.listen({
        port
      }, () => {
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
