import 'regenerator-runtime/runtime';

import chalk                             from 'chalk';
import http                              from 'http';
import express                           from 'express';
import Promise                           from 'bluebird';

import config                            from './config';
import routes                            from './routes';

import logger                            from './middlewares/logger';
import corsPolicy                        from './middlewares/cors-policy';
import notFound                          from './middlewares/not-found';
import errorHandler                      from './middlewares/error-handler';
import { router, get, post, patch, del } from './middlewares/router';

import notificationService               from './services/notification';
import rabbitmq                          from './services/rabbitmq';

export const httpServer = http.createServer();
const app = express();

app.disable('x-powered-by');
if (config.PRODUCTION) {
  app.enable('trust proxy');
}

app.use(logger, corsPolicy, router, notFound, errorHandler);

notificationService(httpServer);

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

post('/web-notification', routes.webNotification.post);

get('/conversations', routes.conversations.get);
post('/conversations', routes.conversations.post);
get('/conversations/:conversation_id', routes.conversations.getOne);

get('/ms', routes.ms.get);

export const listen = () => {
    return new Promise((resolve) => {

    });
};

const getMessageQueue = async (name) => {
    return ch;
};

const cons = async () => {
    const q = 'incoming_http_request';
    const conn = await rabbitmq();
    const ch = await conn.createChannel();

    await ch.assertQueue(q, { durable: false });
    ch.prefetch(1);

    return ch.consume(q, (msg) => {
        console.log('yo');
        ch.sendToQueue(
            msg.properties.replyTo,
            new Buffer(JSON.stringify({
                hello: 'world',
                id: msg.properties.correlationId
            })),
            {
                correlationId: msg.properties.correlationId
            }
        );
        ch.ack(msg);
    });
};

cons();

