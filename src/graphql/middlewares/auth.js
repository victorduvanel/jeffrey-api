import { skip } from 'graphql-resolvers';
import { Unauthorized } from '../errors';

const auth = (_, __, { user }) => {
  if (!user) {
    throw Unauthorized();
  }
  return skip;
};

export default auth;
