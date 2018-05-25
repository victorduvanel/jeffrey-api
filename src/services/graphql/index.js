import _                        from 'lodash';
import bodyParser               from 'body-parser';
import { graphqlExpress }       from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import { execute, subscribe, GraphQLScalarType, formatError } from 'graphql';
import { SubscriptionServer }   from 'subscriptions-transport-ws';
import geocode                  from '../google/geocode';
import oauth2                   from '../../middlewares/oauth2';
import Service                  from '../../models/service';
import ServiceCategory          from '../../models/service-category';
import Message                  from '../../models/message';
import Conversation             from '../../models/conversation';
import AccessToken              from '../../models/access-token';
import Country                  from '../../models/country';
import User                     from '../../models/user';
import PendingUser              from '../../models/pending-user';
import PostalAddress            from '../../models/postal-address';
import Business                 from '../../models/business';
import Review                   from '../../models/review';
import Mission                  from '../../models/mission';
import ProviderPrice            from '../../models/provider-price';

const typeDefs = `
scalar Date

type Query {
  currentUser: User
  businessDetails: Business
  onboardingProgress: [String]
  locality(
    lat: String!
    lng: String!
  ): Locality
  providers(
    offset: Int!
    limit: Int!
  ): [User]
  providers2(
    serviceCategoryId: ID!
    lat: Float!
    lng: Float!
    offset: Int!
    limit: Int!
  ): [User]
  clientHistory(
    providerId: ID!,
    serviceCategoryId: ID!
  ): [Mission]
  clientHistory2: [User]
  providerHistory: [User]
  provider(providerId: ID!): User
  services: [Service]
  serviceCategories: [ServiceCategory]
  serviceCategory(categoryId: String!): ServiceCategory
  conversation(userId: ID!): Conversation
}
type Locality {
  name: String!
  country: Country!
}
type Subscription {
  newMessage(conversationId: String!): Message
}
type Mutation {
  newMission(startDate: String!, price: Int!, clientId: ID!, serviceCategoryId: ID!): Boolean
  newMessage(conversationId: String!, message: String!): Message
  activate(activationCode: String!, firstName: String!, lastName: String!): String
  updatePassword(password: String!): Boolean
  providerDisponibility(disponibility: Boolean!): Boolean
  personalDetails(details: PersonalDetails): Boolean
  businessDetails(details: BusinessDetails): Boolean
  setHourlyRate(serviceCategoryId: ID!, hourlyRate: Int!): Boolean
  providerBio(bio: String!): Boolean
  bankAccount(details: BankAccountDetails): Boolean
}
enum Currency {
  GBP
  EUR
  USD
  KRW
  JPY
  CHF
}
`;

const base = {
  Query: {},
  Mutation: {},
  Subscription: {},

  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      return new Date(value);
    },
    serialize(value) {
      /*
       * The value can be already serialized when it when through redis already (subscription)
       */
      if (value.hasOwnProperty('toISOString')) {
        // throw new Error('Date object expected');
        return value.toISOString();
      }
      return value;
    },
    parseLiteral(/* ast */) {
      console.log('parseLiteral');
      return null;
    },
  })
};

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

    onboardingProgress: async (_, __, { user }) => {
      if (!user) {
        return null;
      }

      return user.onboardingProgress();
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
    Query: {},
    Mutation: {},
    Subscription: {}
  },
  base,
  locality,
  Message.resolver,
  Service.resolver,
  ServiceCategory.resolver,
  Conversation.resolver,
  PostalAddress.resolver,
  User.resolver,
  PendingUser.resolver,
  Business.resolver,
  Review.resolver,
  Mission.resolver
);

const types = [
  Country.graphqlDef(),
  Service.graphqlDef(),
  ServiceCategory.graphqlDef(),
  PostalAddress.graphqlDef(),
  User.graphqlDef(),
  Message.graphqlDef(),
  Conversation.graphqlDef(),
  Business.graphqlDef(),
  Review.graphqlDef(),
  Mission.graphqlDef(),
  ProviderPrice.graphqlDef(),
  typeDefs
].join();

const schema = makeExecutableSchema({
  typeDefs: types,
  resolvers,
  logger: {
    log: err => console.error(err)
  }
});

export const subscriptionServer = (websocketServer) => SubscriptionServer.create(
  {
    schema,
    execute,
    subscribe,
    onConnect: async ({ token }, socket) => {
      if (!token) {
        socket.close();
        return;
      }

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
    graphqlExpress({
      schema,
      context: {
        user: req.user
      },
      formatError: (err) => {
        console.error(err);
        return formatError(err);
      }
    })(req, res, next);
  }
];
