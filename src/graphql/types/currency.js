import { registerType } from '../registry';

const def = `
enum Currency {
  GBP
  EUR
  USD
  KRW
  JPY
  CHF
}
`;

registerType(def, {});
