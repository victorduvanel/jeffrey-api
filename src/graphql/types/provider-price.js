import { registerType } from '../registry';

const def = `
type ProviderPrice {
  id: ID!
  price: Int!
  currency: Currency!
}
`;

registerType(def, {});
