export const resolvers = {
  Query: {},
  Mutation: {},
  Subscription: {}
};

export const types = [];
export const registerType = (def, resolver) => {
  types.push(def);
  Object.assign(resolvers, resolver);
};

const queries = [];
export const registerQuery = (def, resolver) => {
  queries.push(def);
  Object.assign(resolvers.Query, resolver);
};

const subscriptions = [];
export const registerSubscription = (def, resolver) => {
  subscriptions.push(def);
  Object.assign(resolvers.Subscription, resolver);
};

const mutations = [];
export const registerMutation = (def, resolver) => {
  mutations.push(def);
  Object.assign(resolvers.Mutation, resolver);
};

export const typeDefs = () => {
  return `
    ${types.join('\n')}
    type Query {
      ${queries.join('\n')}
    }
    type Subscription {
      ${subscriptions.join('\n')}
    }
    type Mutation {
      ${mutations.join('\n')}
    }
  `;
};
