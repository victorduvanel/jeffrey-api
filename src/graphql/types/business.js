import { registerType } from '../registry';
import Business         from '../../models/business';

const def = `
  enum BusinessType {
    personal
    individual
  }
  input BusinessDetails {
    name: String
    type: String
    taxId: String
    city: String
    country: String
    isOwnerPersonalAddress: Boolean
    line1: String
    line2: String
    postalCode: String
    state: String
  }
  type Business {
    id: ID!
    taxId: String
    name: String
    type: BusinessType
    isOwnerPersonalAddress: Boolean
    postalAddress: PostalAddress
  }
`;

const resolver = {
  Business: {
    postalAddress: async({ id }) => {
      const business = await Business.find(id);
      const postalAddress = await business.getPostalAddress();

      return {
        id: postalAddress.id,
        city: postalAddress.get('city'),
        country: postalAddress.get('country'),
        line1: postalAddress.get('line1'),
        line2: postalAddress.get('line2'),
        postalCode: postalAddress.get('postalCode'),
        state: postalAddress.get('state'),
      };
    }
  }
};

registerType(def, resolver);
