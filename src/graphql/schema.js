import { makeExecutableSchema } from 'graphql-tools';
import { typeDefs, resolvers } from './registry';

export default () => {
  const schema = makeExecutableSchema({
    typeDefs: typeDefs(),
    resolvers,
    // logger: {
    //   log: err => console.error(err)
    // }
  });

  return schema;
};
