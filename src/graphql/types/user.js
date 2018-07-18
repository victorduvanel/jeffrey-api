import { registerType } from '../registry';
import Country          from '../../models/country';
import ProviderPrice    from '../../models/provider-price';

const def = `
enum Gender {
  male
  female
}
input PersonalDetails {
  firstName: String
  lastName: String
  dateOfBirth: String
  gender: Gender
  city: String
  country: String
  line1: String
  line2: String
  postalCode: String
  state: String
}
type User {
  id: ID!
  isProvider: Boolean
  isAvailable: Boolean
  firstName: String
  lastName: String
  dateOfBirth: String
  color: String
  email: String
  gender: Gender
  profilePicture: String
  postalAddress: PostalAddress
  reviews: [Review]
  rank: Float
  bio: String
  prices: [ProviderPrice]
  price(serviceCategoryId: ID): Price
  paymentMethodStatus: String
  country: Country
}
`;

const currentUserOnly = function(callback) {
  return (user, _, { user: currentUser }) => {
    if (!currentUser) {
      throw new Error('Unauthorized');
    }
    if (user.get('id') !== currentUser.get('id')) {
      throw new Error('Unauthorized');
    }
    return callback.apply(this, arguments);
  };
};

const resolver = {
  User: {
    postalAddress: currentUserOnly(async function(user) {
      const postalAddress = await user.getPostalAddress();

      if (!postalAddress) {
        return null;
      }
      return postalAddress.serialize();
    }),

    prices: async(user) => {
      await user.load(['providerPrices']);
      const prices = user.related('providerPrices');

      return prices.toArray().map(price => price.serialize());
    },

    price: async(user, { serviceCategoryId }) => {
      if (!serviceCategoryId) {
        return null;
      }

      return ProviderPrice
        .where({
          user_id: user.id,
          service_category_id: serviceCategoryId
        })
        .fetch();
    },

    country: async(user) => {
      const postalAddress = await user.getPostalAddress();

      if (postalAddress) {
        const countryCode = postalAddress.get('country');
        if (countryCode) {
          return Country.findByCode(countryCode);
        }
      }

      return null;
    }
  }
};

registerType(def, resolver);
