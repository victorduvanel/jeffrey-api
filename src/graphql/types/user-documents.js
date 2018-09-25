import { registerType } from '../registry';

const def = `
type UserDocument {
  id: ID!
  purpose: String
  createdAt: Date
  updatedAt: Date
}
`;

registerType(def, {});
