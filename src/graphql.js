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
    let authorization = 'Bearer 9c0f3e37119340e6e9c8f20dad45235434312b783f3290f81a573164574159eb513f3f92b096bb36919e8c396ca8236a533e4cd1b4ae71b40d7b0b191957ed4692d2770733f93f5dc39ebd4fd7e6c7c783c5b168fbe4cce57694e78d0ea9b2ad5a4911f4a61b98cfc0e3cbe1606cfa68b3250d404e575b88ef2e2b533417bb';
    req.headers.authorization = authorization;

    if (req.headers.authorization) {
      return oauth2(req, res, next);
    }
    next();
  },
  (req, res, next) => {
    graphqlExpress({ schema, context: { user: req.user } })(req, res, next);
  }
];
