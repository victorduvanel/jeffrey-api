import { registerQuery } from '../registry';
import User              from '../../models/user';

const def = `
providers(
  serviceCategoryId: ID!
  lat: Float!
  lng: Float!
  offset: Int!
  limit: Int!
): [User]
`;

const providers = async (_, {
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

registerQuery(def, { providers });
