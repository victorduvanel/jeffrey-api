import bodyParser         from 'body-parser';
import { graphqlExpress } from 'apollo-server-express';
import { formatError }    from 'graphql';
import oauth2             from '../middlewares/oauth2';
import getSchema          from '../graphql/schema';
import { GraphQLError }   from 'graphql';
import { InternalError }  from '../graphql/errors';

export default () => {
  const schema = getSchema();

  return [
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
        debug: true,
        formatError: (err) => {
          if (err instanceof GraphQLError) {
            // err.originalError = null;
            return err;
          }
          return formatError(InternalError(err));
        }
      })(req, res, next);
    }
  ];
};
