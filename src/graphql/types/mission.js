import { registerType } from '../registry';
import Mission          from '../../models/mission';

const def = `
enum MissionStatus {
  accepted
  refused
  canceled
  pending
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
  endDate: Date
  endedDate: Date
  createdAt: Date!
  serviceCategory: ServiceCategory
}
`;

const resolver = {
  Mission: {
    client: async({ id }) => {
      const mission = await Mission.find(id);
      await mission.load(['client']);
      return mission.related('client').serialize();
    },
    provider: async({ id }) => {
      const mission = await Mission.find(id);
      await mission.load(['provider']);
      return mission.related('provider').serialize();
    },
    serviceCategory: async({ id }) => {
      const mission = await Mission.find(id);
      await mission.load(['serviceCategory']);
      return mission.related('serviceCategory').serialize();
    }
  }
};

registerType(def, resolver);
