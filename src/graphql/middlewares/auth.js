import { Unauthorized } from '../errors';

const auth = (_, __, { user }) => {
  if (!user) {
    throw Unauthorized();
  }
};

export default auth;
