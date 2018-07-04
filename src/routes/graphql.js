import bodyParser                    from 'body-parser';
import { graphqlExpress }            from 'apollo-server-express';
import { formatError, GraphQLError } from 'graphql';
import oauth2                        from '../middlewares/oauth2';
import User                          from '../models/user';
import getSchema                     from '../graphql/schema';
import { InternalError }             from '../graphql/errors';
import { AppError }                  from '../errors';

// const FAKE_USER = '2b1a5696-11eb-4858-ad1a-6b23c4e478cd';
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
      graphqlExpress({
        schema,
        context: {
          req,
          user: req.user
        },
        tracing: true,
        cacheControl: true,
        formatError: (err) => {
          console.log('####', err.message, err.locations, err.path);

          if (err instanceof GraphQLError) {
            if (!err.originalError || err.originalError instanceof AppError) {
              return err;
            }
          }

          return formatError(InternalError(err));
        }
      })(req, res, next);
    }
  ];
};
