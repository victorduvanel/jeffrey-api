import { registerType } from '../registry';

const def = `
input PaymentMethodDetails {
  cardHolderName: String!
  cardNumber: String!
  cardExpiryMonth: String!
  cardExpiryYear: String!
  cvv: String!
}
`;

registerType(def);
