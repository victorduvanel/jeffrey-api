import 'babel-polyfill';
import './services/google/datastore';

import chalk                           from 'chalk';
import http                            from 'http';
import express                         from 'express';
import Promise                         from 'bluebird';

import config                          from './config';
import routes                          from './routes';

import { subscriptionServer }          from './services/graphql';

import logger                          from './middlewares/logger';
import corsPolicy                      from './middlewares/cors-policy';
import notFound                        from './middlewares/not-found';
import errorHandler                    from './middlewares/error-handler';
import { router, get, post }           from './middlewares/router';
import graphqlRoute                    from './routes/graphql';
import User                            from './models/user';
import Conversation                    from './models/conversation';
import Mission                         from './models/mission';
import ServiceCategory                 from './models/service-category';

import './graphql/types';
import './graphql/mutations';
import './graphql/subscriptions';
import './graphql/queries';

import { newMessage } from './graphql/mutations/new-message';
import { startMission } from './graphql/mutations/start-mission';
import { endMission } from './graphql/mutations/end-mission';
import { missionStatus } from './graphql/mutations/mission-status';

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

  // const froms = [
  //   '3c656ce5-1e21-4332-a268-d7599f2f0e40',
  //   'd01028fc-53c5-4bf3-ad0b-0f9fa677c90b',
  //   'e96b8bbb-dea6-4495-a31a-870c67509502'
  // ];

  // const user = await User.find(froms[Math.floor(Math.random() * froms.length)]);
  // const user2 = await User.find('854de9f6-22f5-4b6f-b093-9692b50f273b');
  // const conversation = await Conversation.findOrCreate([ user, user2 ]);

  // await newMessage(
  //   null,
  //   { conversationId: conversation.get('id'), message: 'Bonjour' },
  //   { user }
  // );

  res.send({
  });
});

// get('/mission', async (req, res) => {
//   const me = await User.find('8d8fe6fe-e925-45b4-9ba9-3db0ae8864d3');
//   const randomUser = await User.find('403433d4-1725-40fc-8cb5-02071de613ec');

//   const serviceCategory = await ServiceCategory.find('8c47eff2-0313-47ef-898e-2dee01fb98bd');
//   if (!ServiceCategory) {
//     return false;
//   }

//   console.log('======= > createMission');
//   const mission = await Mission.create({
//     startDate: new Date(Date.now()),
//     price: 12,
//     currency: 'EUR',
//     status: 'pending',
//     provider: randomUser,
//     client: me,
//     serviceCategory
//   });

//   // const answers = ['accepted', 'refused', 'canceled'];

//   setTimeout(() => {
//     console.log('======= > missionStatus');
//     missionStatus(
//       null,
//       { id: mission.get('id'), status: 'accepted' },
//       { user: me }
//     );
//   }, 2000);

//   setTimeout(() => {
//     console.log('======= > startMission');
//     startMission(
//       null,
//       { id: mission.get('id') },
//       { user: randomUser }
//     );
//   }, 4000);

//   setTimeout(() => {
//     console.log('======= > endMission');
//     endMission(
//       null,
//       { id: mission.get('id') },
//       { user: randomUser }
//     );

//     res.send({
//       coucou: 'test end'
//     });
//   }, 6000);
// });

router.use('/graphql', ...(graphqlRoute()));
get('/graphiql', routes.graphiql.get);

post('/ping', routes.ping.post);

post('/signup', routes.signup.post);

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

post('/phone-number', routes.phoneNumber.post);
post('/phone-number/verify', routes.phoneNumber.verify.post);

post('/tos', routes.tos.post);
post('/bank-accounts', routes.bankAccounts.post);
post('/providers', routes.providers.post);

post('/stripe/webhook', routes.stripe.webhook.post);

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
