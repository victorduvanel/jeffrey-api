import { combineResolvers } from 'graphql-resolvers';
import auth                 from '../middlewares/auth';
import { registerMutation } from '../registry';
import UserDevice           from '../../models/user-device';

const def = 'userDevice(token: String!, type: String!): Boolean';
const userDevice = async (_, { type, token }, { user }) => {
  await UserDevice.create({ user, token, type });
  return true;
};

registerMutation(def, {
  userDevice: combineResolvers(
    auth,
    userDevice
  )
});
