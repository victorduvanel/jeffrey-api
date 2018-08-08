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
  paymentMethod: String
  location: String
  price: Int!
  currency: Currency!
  startDate: Date!
  startedDate: Date
  endedDate: Date
  totalCost: Int
  createdAt: Date!
  serviceCategory: ServiceCategory
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
    }
  }
};

registerType(def, resolver);
