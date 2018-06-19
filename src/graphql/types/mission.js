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
type Mission {
  id: ID!
  status: MissionStatus!
  client: User!
  provider: User!
  price: Int!
  currency: Currency!
  startDate: Date!
  startedDate: Date
  endedDate: Date
  createdAt: Date!
  serviceCategory: ServiceCategory
}
`;

const resolver = {
  Mission: {
    client: async(mission) => {
      await mission.load(['client']);
      return mission.related('client').serialize();
    },
    provider: async(mission) => {
      await mission.load(['provider']);
      return mission.related('provider').serialize();
    },
    serviceCategory: async(mission) => {
      await mission.load(['serviceCategory']);
      return mission.related('serviceCategory').serialize();
    }
  }
};

registerType(def, resolver);
