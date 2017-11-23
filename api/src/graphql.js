import Promise                  from 'bluebird';
import bodyParser               from 'body-parser';
import { graphqlExpress }       from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import { find, filter }         from 'lodash';

import Message                  from './models/message';
import Conversation             from './models/conversation';
import User                     from './models/user';

const typeDefs = `
  type User {
    id: String!
    firstName: String!
    lastName: String!
  }
  type Conversation {
    id: String!
    name: String!
    messages(first: Int = 100): [Message]
  }
  type Message {
    id: String!
    message: String!
    type: MessageType!
  }
  type Author {
    id: Int!
    firstName: String
    lastName: String
    posts: [Post] # the list of Posts by this author
  }
  type Post {
    id: Int!
    title: String
    author: Author
    votes: Int
  }
  # the schema allows the following query:
  type Query {
    currentUser: User
    posts: [Post]
    conversations: [Conversation]
    authors: [Author]
    author(id: Int!): Author
    messages: [Message]
  }
  # this schema allows the following mutation:
  type Mutation {
    upvotePost (
      postId: Int!
    ): Post
  }

  enum MessageType {
    incoming
    outgoing
  }
`;

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

const resolvers = {
  Query: {
    currentUser: () => {
      return {
        id: '1234',
        firstName: 'william',
        lastName: 'riancho'
      };
    },

    messages: () => {
      return Promise.resolve(messages)
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
    author: (_, { id }) => find(authors, { id: id }),
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
    if (req.body.variables) {
      console.log(req.body.variables.access_token);
    }
    console.log(req.headers);
    next();
  },
  graphqlExpress({ schema })
];
