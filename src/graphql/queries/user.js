import { registerQuery } from '../registry';
import User              from '../../models/user';

const def = 'user(userId: ID!): User';
const user = async (_, { userId }) => {
  const user = await User.find(userId);
  if (!user) {
    return null;
  }
  return user;
};

registerQuery(def, { user });
