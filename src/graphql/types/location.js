import { registerType } from '../registry';

const def = `
  type Location {
    lat: Float!
    lng: Float!
  }
`;

registerType(def, {});
