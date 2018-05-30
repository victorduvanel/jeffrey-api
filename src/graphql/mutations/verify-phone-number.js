import { combineResolvers }        from 'graphql-resolvers';
import auth                        from '../middlewares/auth';
import { registerMutation }        from '../registry';
import PhoneNumberVerificationCode from '../../models/phone-number-verification-code';

const def = 'verifyPhoneNumber(code: String!, phoneNumber: String!): [String]';
const verifyPhoneNumber = async (_, { code, phoneNumber }, { user }) => {
  await PhoneNumberVerificationCode.verify({
    user,
    phoneNumber,
    verificationCode: code
  });
  return user.onboardingProgress();
};

registerMutation(def, { verifyPhoneNumber: combineResolvers(auth, verifyPhoneNumber) });
