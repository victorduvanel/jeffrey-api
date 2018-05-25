import { GraphQLError } from 'graphql';

export const Unauthorized = () => {
  return new GraphQLError('Authentication required');
};

export const InternalError = (originalError) => {
  const err = new GraphQLError('Internal Error');
  err.originalError = originalError;
  return err;
};
