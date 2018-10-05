import { registerType } from '../registry';

const def = `
enum MissionStatus {
  pending
  canceled
  accepted
  refused
  started
  aborted
  confirmed
  terminated
}
input MissionDetails {
  categoryId: ID!
  description: String
  lat: Float!
  lng: Float!
  location: String!
  paymentMethod: String!
}
type Mission {
  id: ID!
  status: MissionStatus!
  client: User
  provider: User
  description: String
  paymentMethod: String
  location: String
  price: Int!
  currency: String!
  startDate: Date!
  startedDate: Date
  endedDate: Date
  totalCost: Int
  createdAt: Date!
  serviceCategory: ServiceCategory
  reviews: [Review]
}
`;

const resolver = {
  Mission: {
    client: async(mission) => {
      await mission.load(['client']);
      return mission.related('client');
    },
    provider: async(mission) => {
      await mission.load(['provider']);
      return mission.related('provider');
    },
    serviceCategory: async(mission) => {
      await mission.load(['serviceCategory']);
      return mission.related('serviceCategory');
    },
    reviews: async(mission) => {
      await mission.load(['reviews']);
      return mission.related('reviews');
    }
  }
};

registerType(def, resolver);
