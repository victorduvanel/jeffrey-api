import { GraphQLScalarType } from 'graphql';
import { registerType }      from '../registry';

const def = 'scalar Date';

const resolver = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      return new Date(value);
    },
    serialize(value) {
      /*
       * The value can be already serialized when it when through redis already
       * (subscription)
       */
      if (value.hasOwnProperty('toISOString')) {
        // throw new Error('Date object expected');
        return value.toISOString();
      }
      return value;
    },
    parseLiteral(/* ast */) {
      console.log('parseLiteral');
      return null;
    },
  })
};

registerType(def, resolver);
