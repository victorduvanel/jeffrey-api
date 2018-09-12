import { registerType } from '../registry';
import Mission          from '../../models/mission';
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
  unseenActivity: Boolean
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
  currentMission: Mission
  serviceCategories: [ServiceCategory]
  rank: Float
  bio: String
  prices: [ProviderPrice]
  price(serviceCategoryId: ID): Price
  paymentMethodStatus: String
  country: Country
  phoneNumber: String
  identityDocuments: [UserDocument]
}
`;

const currentUserOnly = function(callback) {
  return function(user, _, { user: currentUser }) {
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
    postalAddress: currentUserOnly(async (user) => {
      const postalAddress = await user.getPostalAddress();

      if (!postalAddress) {
        return null;
      }
      return postalAddress.serialize();
    }),

    phoneNumber: currentUserOnly(user => user.get('phoneNumber')),

    identityDocuments: currentUserOnly(async (user) => {
      const documents = await user.identifyDocuments();
      return documents.models;
    }),

    prices: async (user) => {
      await user.load(['providerPrices']);
      const prices = user.related('providerPrices');

      return prices.toArray().map(price => price.serialize());
    },

    price: async (user, { serviceCategoryId }) => {
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

    country: async (user) => {
      return user.country();
    },

    /**
     * Retreive the current mission (has a provider) for the given client.
     * The authenticated user is the client.
     */
    currentMission: async (provider, _, { user: client }) => {
      const mission = await Mission
        .query((qb) => {
          qb.where('client_id', client.get('id'));
          qb.where('provider_id', provider.get('id'));
          qb.whereNotNull('started_date');
          qb.whereNull('ended_date');
          qb.orderBy('started_date', 'DESC');
          qb.limit(1);
        })
        .fetch();

      return mission;
    },

    serviceCategories: async (user, _, { parentId }) => {
      const categories = await user.serviceCategories({ childrenOf: parentId });
      return categories;
    }
  }
};

registerType(def, resolver);
