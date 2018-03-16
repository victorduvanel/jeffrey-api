import Promise                  from 'bluebird';
import bodyParser               from 'body-parser';
import { graphqlExpress }       from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import { find, filter }         from 'lodash';

import { PubSub } from 'graphql-subscriptions';

import { SubscriptionServer } from 'subscriptions-transport-ws';

import { geocode }              from './services/google';
import oauth2                   from './middlewares/oauth2';
import { graphql, execute, subscribe }              from 'graphql';
import Service                  from './models/service';
import Message                  from './models/message';
import Country                  from './models/country';
import User                     from './models/user';
import typeDefs                 from './graphql-type-defs.gql';

const NEW_MESSAGE_TOPIC = 'NEW_MESSAGE_TOPIC';

const pubsub = new PubSub();

const messages = [];

const providers = [
  {
    id: '123',
    name: 'Morray'
  },
  {
    id: '456',
    name: 'Michel'
  }
];

const resolvers = {
  Query: {
    currentUser: (_, __, { user }, params) => {
      if (user) {
        return {
          id: user.id,
          firstName: user.get('firstName'),
          lastName: user.get('lastName'),
          email: user.get('email'),
          // phoneNumber: user.get('phoneNumber'),
          profilePicture: user.get('profilePicture')
        };
      }
      return null;
    },

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

    services: async () => {
      const services = await Service.fetchAll();

      return services.map(service => ({
        id: service.get('id'),
        name: service.get('name')
      }));
    },

    providers: () => {
      return Promise.resolve(providers);
    },

    conversation: () => {
      return Promise.resolve(messages);
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
  },

  Subscription: {
    newMessage: {
      subscribe: () => {
        return pubsub.asyncIterator(NEW_MESSAGE_TOPIC);
      }
    }
  }

};

let id = 2;
setInterval(() => {
  pubsub.publish(NEW_MESSAGE_TOPIC, {
    newMessage: {
      id: (id++).toString(),
      message: `Bonjour ${id}`,
      type: (Math.floor(Math.random() * 1000) % 2) ? 'outgoing' : 'incoming',
      time: (new Date()).toISOString()
    }
  });
}, 5000);

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export const subscriptionServer = (websocketServer) => SubscriptionServer.create(
  {
    schema,
    execute,
    subscribe,
  },
  {
    server: websocketServer,
    path: '/graphql',
  },
);

export default [
  bodyParser.json(),
  (req, res, next) => {
    if (req.headers.authorization) {
      return oauth2(req, res, next);
    }
    next();
  },
  (req, res, next) => {
    graphqlExpress({ schema, context: { user: req.user } })(req, res, next);
  }
];
