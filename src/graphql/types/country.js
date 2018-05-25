import { registerType } from '../registry';

const def = `
  type Country {
    id: String!
    name: String!
    code: String!
  }
`;

registerType(def, {});
