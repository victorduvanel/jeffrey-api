import _                                       from 'lodash';
import Promise                                 from 'bluebird';
import bodyParser                              from 'body-parser';
import { graphqlExpress }                      from 'apollo-server-express';
import { makeExecutableSchema }                from 'graphql-tools';
import { find, filter }                        from 'lodash';
import { graphql, execute, subscribe }         from 'graphql';
import { SubscriptionServer }                  from 'subscriptions-transport-ws';
import pubsub, { CONVERSATION_ACTIVITY_TOPIC } from './pubsub';
import typeDefs                                from './graphql-type-defs.gql';
import { Unauthorized }                        from '../../errors';
import geocode                                 from '../google/geocode';
import oauth2                                  from '../../middlewares/oauth2';
import Service                                 from '../../models/service';
import Provider                                from '../../models/provider';
import Message                                 from '../../models/message';
import Conversation                            from '../../models/conversation';
import AccessToken                             from '../../models/access-token';
import Country                                 from '../../models/country';
import User                                    from '../../models/user';

const messages = [];

const locality = {
  Query: {
    locality: async (_, { lat, lng }) => {
      const location = await geocode({ lat, lng });

      if (location) {
        const country = await Country.findByCode(location.country);

        if (country) {
          return {
            name: location.locality,
            countryId: country.id
          };
        }
      }
      return null;
    },
  },

  Locality: {
    country: async (locality) => {
      const country = await Country.find(locality.countryId);

      return {
        id: country.id,
        name: country.get('name'),
        code: country.get('code')
      };
    }
  }
};

const resolvers = _.merge(
  {
    Query: {}
  },
  locality,
  Message.resolver,
  Service.resolver,
  Provider.resolver,
  Conversation.resolver,
  User.resolver
);

console.dir(resolvers);

const schema = makeExecutableSchema({
  typeDefs: [
    Country.graphqlDef(),
    Service.graphqlDef(),
    Provider.graphqlDef(),
    User.graphqlDef(),
    Message.graphqlDef(),
    Conversation.graphqlDef(),
    typeDefs
  ].join(),
  resolvers,
});

export const subscriptionServer = (websocketServer) => SubscriptionServer.create(
  {
    schema,
    execute,
    subscribe,
    onConnect: async ({ token }, socket) => {
      try {
        if (token) {
          const accessToken = await AccessToken.find(token);
          if (accessToken) {
            const user = accessToken.related('user');
            return { user };
          }
        }
      } catch (err) {
        console.error(err);
        return {};
      }
    }
  },
  {
    server: websocketServer,
    path: '/graphql',
  },
);

export default [
  bodyParser.json(),
  (req, res, next) => {
    let authorization = req.get('authorization');
    if (authorization) {
      return oauth2(req, res, next);
    }
    return next();
  },
  (req, res, next) => {
    console.log(req.user);
    graphqlExpress({ schema, context: { user: req.user } })(req, res, next);
  }
];
