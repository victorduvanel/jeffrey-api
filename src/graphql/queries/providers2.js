import { combineResolvers } from 'graphql-resolvers';
import { registerQuery }    from '../registry';
import auth                 from '../middlewares/auth';
import User                 from '../../models/user';

const def = `
providers2(
  serviceCategoryId: ID!
  lat: Float!
  lng: Float!
  offset: Int!
  limit: Int!
): [User]
`;

const providers2 = async (_, {
  serviceCategoryId,
  lat,
  lng,
  offset,
  limit
}) => {
  const providers = await User.findProviders({
    serviceCategoryId,
    lat,
    lng,
    offset,
    limit
  });
  return providers.toArray().map(user => user.serialize());
};

registerQuery(def, {
  providers2: combineResolvers(auth, providers2)
});
