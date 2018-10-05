import { combineResolvers }        from 'graphql-resolvers';
import auth                        from '../middlewares/auth';
import { registerMutation }        from '../registry';
import PhoneNumberVerificationCode from '../../models/phone-number-verification-code';
import User                        from '../../models/user';

const def = 'phoneNumber(phoneNumber: String!): Boolean';
const phoneNumber = async (_, { phoneNumber }, { req, user }) => {

  const userWithSameNumber = await User.query('where', 'phone_number', '=', phoneNumber).fetchAll();
  if (userWithSameNumber.length !== 0) {
    throw new Error('duplicate_phone_number');
  }

  await PhoneNumberVerificationCode.create({
    user,
    phoneNumber,
    ip: req.ip,
    intl: req.intl
  });
  return true;
};

registerMutation(def, { phoneNumber: combineResolvers(auth, phoneNumber) });
