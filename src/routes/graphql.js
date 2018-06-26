import bodyParser         from 'body-parser';
import { graphqlExpress } from 'apollo-server-express';
import { formatError, GraphQLError } from 'graphql';
import oauth2             from '../middlewares/oauth2';
import User               from '../models/user';
import knex               from '../services/knex';
import getSchema          from '../graphql/schema';
import { InternalError }  from '../graphql/errors';
import { AppError }       from '../errors';

export default () => {
  const schema = getSchema();

  return [
    bodyParser.json(),
    async (req, res, next) => {
      const me = await User.find('2b1a5696-11eb-4858-ad1a-6b23c4e478cd');
      // me.set('updatedAt', knex.raw('NOW()'));
      // await me.save();
      // await me.refresh();
      // console.log('$$$$$', me.get('updatedAt'));
      console.log(me.id);

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
          console.log('####', err.message);

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
