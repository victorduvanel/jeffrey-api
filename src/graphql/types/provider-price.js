import { registerType } from '../registry';

const def = `
type ProviderPrice {
  id: ID!
  price: Int!
  currency: String!
  isEnabled: Boolean!
}
`;

registerType(def, {});
