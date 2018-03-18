import { graphiqlExpress } from 'apollo-server-express';

export const get = [
  graphiqlExpress({
    endpointURL: '/graphql',
  })
];
