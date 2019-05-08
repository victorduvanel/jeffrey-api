import _ from 'lodash';
import onFinished from 'on-finished';
import onHeaders from 'on-headers';
import { skip, combineResolvers } from 'graphql-resolvers';

function recordStartTime() {
  this._startAt = process.hrtime();
  this._startTime = new Date();
}

export const resolvers = {
  Query: {},
  Mutation: {},
  Subscription: {}
};

export const types = [];
export const registerType = (def, resolver) => {
  types.push(def);
  if (resolver) {
    Object.assign(resolvers, resolver);
  }
};

function getResponseTimeToken(req, res, digits) {
  if (!req._startAt || !res._startAt) {
    // missing request and/or response start time
    return;
  }

  // calculate diff
  const ms = (res._startAt[0] - req._startAt[0]) * 1e3 +
    (res._startAt[1] - req._startAt[1]) * 1e-6;

  // return truncated value
  return ms.toFixed(digits === undefined ? 3 : digits);
}


const logger = (__, variables, context, query) => {
  const { req, res } = context;

  recordStartTime.call(req);

  if (res) {
    onHeaders(res, recordStartTime);

    onFinished(res, () => {
      process.stdout.write(
        `[graphql] ${query.operation.operation} ${query.fieldName}${ _.isEmpty(variables) ? '' : `(${JSON.stringify(variables)})` } ${getResponseTimeToken(req, res)} ms\n`
      );
    });
  } else {
    process.stdout.write(
      `[graphql] ${query.operation.operation} ${query.fieldName}${ _.isEmpty(variables) ? '' : `(${JSON.stringify(variables)})` }\n`
    );
  }

  return skip;
};

const queries = [];
export const registerQuery = (def, resolver) => {
  queries.push(def);

  const wrappedResolver = {};
  _.forEach(resolver, (value, key) => {
    wrappedResolver[key] = combineResolvers(logger, value);
  });

  Object.assign(resolvers.Query, wrappedResolver);
};

const subscriptions = [];
export const registerSubscription = (def, resolver) => {
  subscriptions.push(def);

  const wrappedResolver = {};
  _.forEach(resolver, (value, key) => {
    wrappedResolver[key] = {
      ...value,
      subscribe: combineResolvers(logger, value.subscribe)
    };
  });

  Object.assign(resolvers.Subscription, wrappedResolver);
};

const mutations = [];
export const registerMutation = (def, resolver) => {
  mutations.push(def);

  const wrappedResolver = {};
  _.forEach(resolver, (value, key) => {
    wrappedResolver[key] = combineResolvers(logger, value);
  });

  Object.assign(resolvers.Mutation, wrappedResolver);
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
