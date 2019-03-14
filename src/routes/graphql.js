import bodyParser                    from 'body-parser';
import { ApolloServer }              from 'apollo-server-express';
import { formatError, GraphQLError } from 'graphql';
import config                        from '../config';
import oauth2                        from '../middlewares/oauth2';
import User                          from '../models/user';
import raven                         from '../services/raven';
import getSchema                     from '../graphql/schema';
import { InternalError }             from '../graphql/errors';
import { AppError }                  from '../errors';

export default () => {
  const schema = getSchema();
  const server = new ApolloServer({
    schema,
    context: ({ req, res }) => {
      const acceptLanguage = req.headers['accept-language'];

      return {
        req,
        user: req.user,
        locale: acceptLanguage
      };
    }
  });
  return server;
};


export const middlewares = [
  bodyParser.json(),
  async (req, res, next) => {
    let authorization = req.get('authorization');
    if (authorization) {
      return oauth2(req, res, next);
    }
    return next();
  }
];

// export default () => {
//   const schema = getSchema();
//
//   return [
//     async (req, res, next) => {
//       const acceptLanguage = req.headers['accept-language'];
//
//       graphqlExpress({
//         schema,
//         context: {
//           req,
//           user: req.user,
//           locale: acceptLanguage
//         },
//         // debug: false,
//         tracing: config.PRODUCTION,
//         cacheControl: config.PRODUCTION,
//         formatError: (err) => {
//           if (!config.PRODUCTION) {
//             console.error(err);
//           }
//
//           if (err instanceof GraphQLError) {
//             if (!err.originalError || err.originalError instanceof AppError) {
//               return err;
//             }
//           }
//
//           raven.captureException(err);
//
//           return formatError(InternalError(err));
//         }
//       })(req, res, next);
//     }
//   ];
// };
