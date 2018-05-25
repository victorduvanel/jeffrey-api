import { registerType } from '../registry';

const def = `
type PostalAddress {
  id: ID!
  city: String
  country: String
  line1: String
  line2: String
  postalCode: String
  state: String
}
`;

registerType(def, {});
