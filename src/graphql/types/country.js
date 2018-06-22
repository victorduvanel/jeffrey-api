import { registerType } from '../registry';

const def = `
  type Country {
    id: String!
    name: String!
    phoneCode: String!
    flag: String!
    code: String!
  }
`;

registerType(def, {});
