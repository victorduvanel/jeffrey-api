import { registerType } from '../registry';

const def = `
  type Country {
    id: String!
    name: String!
    phoneCode: Int!
    code: String!
  }
`;

registerType(def, {});
