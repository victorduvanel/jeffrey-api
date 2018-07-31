import { registerType } from '../registry';

const def = `
type ServiceCategory {
  id: ID!
  slug: String!
  color: String
  subCategories: [ServiceCategory]
  root: ServiceCategory
  parent: ServiceCategory
  avgPrice(currency: Currency!): Price
  providerPrice: Price
}
`;

registerType(def);
