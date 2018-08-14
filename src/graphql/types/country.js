import { registerType } from '../registry';

const def = `
  type Country {
    id: String!
    name: String!
    phoneCode: String!
    flag: String!
    code: String!
    currency: String
  }
`;

registerType(def, {});
