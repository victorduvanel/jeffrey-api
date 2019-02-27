import { registerType } from '../registry';

const def = `
type ServiceAttributes {
  name: String
  icon: String
}
type ServiceCategory {
  id: ID!
  slug: String!
  color: String!
  icon: String
  subCategories: [ServiceCategory]
  root: ServiceCategory
  parent: ServiceCategory
  avgPrice: Price
  providerPrice: Price
  attrs(lang: String): ServiceAttributes
}
`;

const resolver = {
  ServiceCategory: {
    attrs: async (serviceCategory, { lang }, { locale }) => {
      if (!lang && locale) {
        return serviceCategory.attrs(locale.split('-').shift());
      }
      return serviceCategory.attrs(lang);
    }
  }
};

registerType(def, resolver);
