import { registerType } from '../registry';

const def = `
  type Price {
    amount: Int!
    currency: String!
    isEnabled: Boolean
  }
`;

registerType(def, {});
