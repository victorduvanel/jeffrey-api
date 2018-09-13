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

const resolver = {
  UserDocument: {
    owner: async(document) => {
      await document.load(['owner']);
      return document.related('owner');
    }
  }
};

registerType(def, resolver);
