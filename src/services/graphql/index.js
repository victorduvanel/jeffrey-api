import Promise                  from 'bluebird';
import bodyParser               from 'body-parser';
import { graphqlExpress }       from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import { find, filter }         from 'lodash';
import { graphql, execute, subscribe } from 'graphql';
import { SubscriptionServer }   from 'subscriptions-transport-ws';
import pubsub, { CONVERSATION_ACTIVITY_TOPIC } from './pubsub';
import typeDefs                 from './graphql-type-defs.gql';
import { Unauthorized }         from '../../errors';
import geocode                  from '../google/geocode';
import oauth2                   from '../../middlewares/oauth2';
import Service                  from '../../models/service';
import Message                  from '../../models/message';
import Conversation             from '../../models/conversation';
import AccessToken              from '../../models/access-token';
import Country                  from '../../models/country';
import User                     from '../../models/user';

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
    currentUser: (_, __, { user }) => {
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

    conversations: async (_, __, { user }, params) => {
      if (!user) {
        throw Unauthorized;
      }

      const conversationId = params.conversationId;

      const conversation = await Conversation.find({
        id: conversationId,
        user
      });

      if (!conversation) {
        return null;
      }

      // await conversation.load(['to', 'from']);

      // const toUser = conversation.related('to');
      // const fromUser = conversation.related('from');

      send({
        data: {
          id: conversation.get('id'),
          type: 'conversation',
          attributes: {
            to: toPhoneNumber.get('phoneNumber'),
            from: fromPhoneNumber.get('phoneNumber'),
            name: conversation.get('name') || ''
          }
        }
      });

      await user.load([
        'conversations',
        'conversations.to',
        'conversations.from'
      ]);

      const conversations = user.related('conversations');

      const responseData = conversations.map((conversation) => {
        const toPhoneNumber = conversation.related('to');
        const fromPhoneNumber = conversation.related('from');

        return {
          id: conversation.get('id'),
          type: 'conversation',
          attributes: {
            to: toPhoneNumber.get('phoneNumber'),
            from: fromPhoneNumber.get('phoneNumber'),
            name: conversation.get('name') || ''
          }
        };
      });

      res.send({
        data: responseData
      });

      return Promise.resolve(messages);
    },

    conversation: async (_, { conversationId }, { user }, params) => {
      const conversation = await Conversation.find(conversationId);

      await conversation.load(['participants']);

      const participants = conversation.related('participants');
      if (participants.map(user => user.id).includes(user.get('id'))) {
        return {
          id: conversation.get('id')
        };
      }

      return null;
    }
  },

  Conversation: {
    participants: async(conversation) => {
      await conversation.load(['participants']);
    },

    messages: async({ id }) => {
      const conversation = await Conversation.find(id);

      await conversation.load([{
        messages: query => query.orderBy('created_at', 'desc')
      }]);

      return conversation.related('messages').map(message => ({
        id: message.get('id'),
        message: message.get('body'),
        fromId: message.get('fromId'),
        time: message.get('createdAt').toISOString()
      }));
    },
  },

  Message: {
    from: async({ id }) => {
      const message = await Message.find(id);
      await message.load(['from']);
      const from = message.related('from');
      return {
        id: from.get('id'),
        profilePicture: from.get('profilePicture')
      };
    }
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
      subscribe: (_, { conversationId }, { user }) => {
        return pubsub.asyncIterator(`${CONVERSATION_ACTIVITY_TOPIC}.${user.get('id')}`);
      }
    }
  },

  Mutation: {
    newMessage: async (_, { conversationId, message: body, ...args }, { user, ...others }) => {
      try {
        const conversation = await Conversation.find(conversationId);
        await conversation.load(['participants']);

        const message = await Message.create({ from: user, body, conversation });
        conversation.notifyParticipants(message);

        return {
          id: message.get('id'),
          message: message.get('body'),
          from: message.get('fromId'),
          time: message.get('createdAt')
        };
      } catch (err) {
        console.error(err);
      }
    }
  },


};

/*
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
*/

const schema = makeExecutableSchema({
  typeDefs,
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
    graphqlExpress({ schema, context: { user: req.user } })(req, res, next);
  }
];
