import { registerType } from '../registry';
import User             from '../../models/user';
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
  phone: String
  profilePicture: String
  phoneNumber: String
  postalAddress: PostalAddress
  reviews: [Review]
  rank: Float
  bio: String
  prices: [ProviderPrice]
  price(serviceCategoryId: ID): Price
  paymentMethodStatus: String
}
`;

const resolver = {
  User: {
    postalAddress: async({ id }) => {
      const user = await User.find(id);
      const postalAddress = await user.getPostalAddress();

      if (!postalAddress) {
        return null;
      }
      return postalAddress.serialize();
    },

    prices: async({ id }) => {
      const user = await User.find(id);
      if (!user) {
        return null;
      }

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
    }
  }
};

registerType(def, resolver);
