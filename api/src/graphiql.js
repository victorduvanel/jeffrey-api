import { graphiqlExpress } from 'apollo-server-express';

export default [
  graphiqlExpress({
    endpointURL: '/graphql',
  })
];
