import { GraphQLError } from 'graphql';
import { AppError}      from '../../errors';

export const Unauthorized = () => {
  return new AppError('Unauthorized');
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
