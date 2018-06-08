import { registerType } from '../registry';

const def = `
  type Price {
    amount: Int!
    currency: Currency!
  }
`;

registerType(def, {});
