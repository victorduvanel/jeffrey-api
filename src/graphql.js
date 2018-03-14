import Promise                  from 'bluebird';
import bodyParser               from 'body-parser';
import { graphqlExpress }       from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import { find, filter }         from 'lodash';

import { geocode }              from './services/google';
import oauth2                   from './middlewares/oauth2';
import { graphql }              from 'graphql';
import Service                  from './models/service';
import Message                  from './models/message';
import Country                  from './models/country';
import User                     from './models/user';
import typeDefs                 from './graphql-type-defs.gql';

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

    messages: () => {
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
