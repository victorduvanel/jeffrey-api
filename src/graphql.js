import Promise                  from 'bluebird';
import bodyParser               from 'body-parser';
import { graphqlExpress }       from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import { find, filter }         from 'lodash';

import { geocode }              from './services/google';
import oauth2                   from './middlewares/oauth2';
import { graphql } from 'graphql';
import Service                  from './models/service';
import Message                  from './models/message';
import Country                  from './models/country';
import Conversation             from './models/conversation';
import User                     from './models/user';
import typeDefs                 from './graphql-type-defs.gql';

// example data
const authors = [
  { id: 1, firstName: 'Tom', lastName: 'Coleman' },
  { id: 2, firstName: 'Sashko', lastName: 'Stubailo' },
  { id: 3, firstName: 'Mikhail', lastName: 'Novikov' },
];
const posts = [
  { id: 1, authorId: 1, title: 'Introduction to GraphQL', votes: 2 },
  { id: 2, authorId: 2, title: 'Welcome to Meteor', votes: 3 },
  { id: 3, authorId: 2, title: 'Advanced GraphQL', votes: 1 },
  { id: 4, authorId: 3, title: 'Launchpad is Cool', votes: 7 },
];
const messages = [
  { id: '123' },
  { id: '456' }
];
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
          lastName: user.get('lastName')
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

    messages: () => {
      return Promise.resolve(messages);
    },

    conversations: async () => {
      const user = await User.forge({
        id: '2fe88767-9af9-4944-abb0-03fbdb2ab1da'
      });

      await user.load([
        'conversations'
      ]);

      const conversations = user.related('conversations');

      return conversations.map((conversation) => {
        return {
          id: conversation.get('id'),
          name: conversation.get('name') || ''
        };
      });
    },

    posts: () => posts,
    authors: () => authors,
  },
  Mutation: {
    upvotePost: (_, { postId }) => {
      const post = find(posts, { id: postId });
      if (!post) {
        throw new Error(`Couldn't find post with id ${postId}`);
      }
      post.votes += 1;
      return post;
    },
  },

  Author: {
    posts: (author) => filter(posts, { authorId: author.id }),
  },

  Post: {
    author: (post) => find(authors, { id: post.authorId }),
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

  Conversation: {
    messages: async ({ id: conversationId }, params) => {

      const user = await User.forge({
        id: '2fe88767-9af9-4944-abb0-03fbdb2ab1da'
      });

      const conversation = await Conversation.find({
        id: conversationId,
        user
      });

      await conversation.load(['conversationMessages.message']);
      const conversationMessages = conversation.related('conversationMessages');

      return conversationMessages.map((conversationMessage) => {
        const message = conversationMessage.related('message');

        return {
          id: message.get('id'),
          message: message.get('body'),
          type: conversationMessage.get('type'),
          date: message.get('createdAt')
        };
      });
    }
  }
};


const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

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
