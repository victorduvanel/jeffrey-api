import { registerType } from '../registry';

const def = `
type ServiceAttributes {
  name: String
  icon: String!
}
type ServiceCategory {
  id: ID!
  slug: String!
  color: String
  subCategories: [ServiceCategory]
  root: ServiceCategory
  parent: ServiceCategory
  avgPrice(currency: Currency!): Price
  providerPrice: Price
  attrs(lang: String): ServiceAttributes
}
`;

const resolver = {
  ServiceCategory: {
    attrs: async (serviceCategory, { lang }) => {
      return serviceCategory.attrs(lang);
    }
  }
};

registerType(def, resolver);
