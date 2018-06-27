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

const providers = async (_,
  {
    serviceCategoryId,
    lat,
    lng,
    offset,
    limit
  },
  {
    user
  }
) => {
  let providers = await User.findProviders({
    serviceCategoryId,
    lat,
    lng,
    offset,
    limit
  });

  providers = providers.toArray();

  if (user) {
    providers = providers.filter(provider => provider.id !== user.id);
  }

  return providers.map(user => user.serialize());
};

registerQuery(def, { providers });
