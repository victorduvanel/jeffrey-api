import bodyParser         from 'body-parser';
import { graphqlExpress } from 'apollo-server-express';
import { formatError, GraphQLError } from 'graphql';
import oauth2             from '../middlewares/oauth2';
import getSchema          from '../graphql/schema';
import { InternalError }  from '../graphql/errors';

export default () => {
  const schema = getSchema();

  return [
    bodyParser.json(),
    async (req, res, next) => {
      let authorization = req.get('authorization');
      if (authorization) {
        return oauth2(req, res, next);
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
        debug: true,
        formatError: (err) => {
          if (err instanceof GraphQLError) {
            if (!err.originalError || err.originalError instanceof GraphQLError) {
              return err;
            }
          }

          return formatError(InternalError(err));
        }
      })(req, res, next);
    }
  ];
};
