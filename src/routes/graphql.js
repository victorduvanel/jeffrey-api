import bodyParser                    from 'body-parser';
import { graphqlExpress }            from 'apollo-server-express';
import { formatError, GraphQLError } from 'graphql';
import config                        from '../config';
import oauth2                        from '../middlewares/oauth2';
import User                          from '../models/user';
import raven                         from '../services/raven';
import getSchema                     from '../graphql/schema';
import { InternalError }             from '../graphql/errors';
import { AppError }                  from '../errors';

//const FAKE_USER = '904e2ad9-d91b-4222-bcd8-4c98e62072b5';
const FAKE_USER = null;

export default () => {
  const schema = getSchema();

  return [
    bodyParser.json(),
    async (req, res, next) => {
      if (FAKE_USER) {
        req.user = await User.find(FAKE_USER);
      } else {
        let authorization = req.get('authorization');
        if (authorization) {
          return oauth2(req, res, next);
        }
      }
      return next();
    },
    async (req, res, next) => {
      const acceptLanguage = req.headers['accept-language'];

      graphqlExpress({
        schema,
        context: {
          req,
          user: req.user,
          locale: acceptLanguage
        },
        // debug: false,
        tracing: config.PRODUCTION,
        cacheControl: config.PRODUCTION,
        formatError: (err) => {
          if (!config.PRODUCTION) {
            console.error(err);
          }

          if (err instanceof GraphQLError) {
            if (!err.originalError || err.originalError instanceof AppError) {
              return err;
            }
          }

          raven.captureException(err);

          return formatError(InternalError(err));
        }
      })(req, res, next);
    }
  ];
};
