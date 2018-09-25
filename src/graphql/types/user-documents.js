import { registerType } from '../registry';

const def = `
type UserDocument {
  id: ID!
  purpose: String
  owner: User
  createdAt: Date
  updatedAt: Date
}
`;

registerType(def, {});
