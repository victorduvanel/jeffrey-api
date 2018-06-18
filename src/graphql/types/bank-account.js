import { registerType } from '../registry';

const def = `
enum BankAccountType {
  company
  individual
}
input BankAccountDetails {
  type: BankAccountType
  iban: String
  holderName: String
  country: String
}
`;

registerType(def);
