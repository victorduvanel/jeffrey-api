import { GraphQLError } from 'graphql';

export const Unauthorized = () => {
  return new GraphQLError('Authentication required');
};

export const InternalError = (originalError) => {
  const err = new GraphQLError(
    'Internal Error',
    originalError.nodes,
    originalError.source,
    originalError.positions,
    originalError.path,
    originalError,
    originalError.extensions
  );
  return err;
};
