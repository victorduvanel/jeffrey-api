import { registerType } from '../registry';

const def = `
input PaymentMethodDetails {
  cardHolderName: String!
  cardNumber: String!
  cardExpiryMonth: String!
  cardExpiryYear: String!
  cvv: String!
}

type PaymentMethod {
  id: ID!
  type: String
  lastFour: String
  expMonth: String
  expYear: String
  holderName: String
}
`;

registerType(def);
