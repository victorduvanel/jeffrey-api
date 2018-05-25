import Promise              from 'bluebird';
import { combineResolvers } from 'graphql-resolvers';
import auth                 from '../middlewares/auth';
import { registerQuery }    from '../registry';
import User                 from '../../models/user';

const def = `
providers(
  offset: Int!
  limit: Int!
): [User]
`;

const providers = async (_, __, ___, { variableValues: { limit, offset } }) => {
  const users = await User
    .query({ limit, offset })
    .query((qb) => {
      qb.where('is_provider', '=', true);
    })
    .fetchAll();

  return Promise.map(users.toArray(), async user => user.serialize());
};

registerQuery(def, {
  providers: combineResolvers(auth, providers)
});
