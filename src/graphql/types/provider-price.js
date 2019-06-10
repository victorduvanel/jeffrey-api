import { registerType } from '../registry';

const def = `
type ProviderPrice {
  id: ID!
  isEnabled: Boolean!
}
`;

registerType(def, {});
