import { registerQuery } from '../registry';
import User              from '../../models/user';

const def = 'provider(providerId: ID!): User';
const provider = async (_, { providerId }) => {
  const user = await User.find(providerId);
  if (!user) {
    return null;
  }
  return user;
};

registerQuery(def, { provider });
