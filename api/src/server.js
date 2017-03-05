import 'regenerator-runtime/runtime';

import chalk                 from 'chalk';
import http                  from 'http';
import express               from 'express';
import Promise               from 'bluebird';

import config                from './config';
import routes                from './routes';

import logger                from './middlewares/logger';
import corsPolicy            from './middlewares/cors-policy';
import notFound              from './middlewares/not-found';
import errorHandler from './middlewares/error-handler';
import { router, get, post, patch } from './middlewares/router';

export const httpServer = http.createServer();
const app = express();

app.disable('x-powered-by');
if (config.PRODUCTION) {
  app.enable('trust proxy');
}

app.use(logger, corsPolicy, router, notFound, errorHandler);

httpServer.on('request', app);

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
post('/phone-numbers', routes.phoneNumber.post);

post('/messages', routes.messages.post);

get('/invoices', routes.invoices.get);
get('/invoices/:invoice_id', routes.invoices.getOne);

get('/terms', routes.terms.get);

export const listen = () => {
  const prom = new Promise((resolve) => {
    httpServer.on('close', resolve);
  });

  httpServer.listen(config.port, () => {
    const addr = httpServer.address();
    /* eslint-disable no-console */
    console.log(chalk.green(`Listening on ${addr.address}:${addr.port}`));
    /* eslint-enable no-console */
  });

  return prom;
};
