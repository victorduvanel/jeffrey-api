import { combineResolvers }        from 'graphql-resolvers';
import auth                        from '../middlewares/auth';
import { registerMutation }        from '../registry';
import PhoneNumberVerificationCode from '../../models/phone-number-verification-code';

const def = 'phoneNumber(phoneNumber: String!): Boolean';
const phoneNumber = async (_, { phoneNumber }, { req, user }) => {
  await PhoneNumberVerificationCode.create({
    user,
    phoneNumber,
    ip: req.ip,
    intl: req.intl
  });
  return true;
};

registerMutation(def, { phoneNumber: combineResolvers(auth, phoneNumber) });
