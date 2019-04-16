import { combineResolvers } from 'graphql-resolvers';
import auth                 from '../middlewares/auth';
import { registerMutation } from '../registry';
import UserDevice           from '../../models/user-device';

const def = 'userDevice(token: String!, type: String!, locale: String!): Boolean';
const userDevice = async (_, { type, token, locale }, { user, req }) => {
  const { accessToken } = req;
  await UserDevice.create({ user, token, type, locale, accessToken });
  return true;
};

registerMutation(def, {
  userDevice: combineResolvers(
    auth,
    userDevice
  )
});
