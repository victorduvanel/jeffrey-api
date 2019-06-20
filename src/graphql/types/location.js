import { registerType } from '../registry';

const def = `
  type Location {
    lat: Float!
    lng: Float!
    description: String
  }
`;

registerType(def, {});
