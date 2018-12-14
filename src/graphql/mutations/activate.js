import PendingUser              from '../../models/pending-user';
import User, { DuplicatedUser } from '../../models/user';
import errors                   from '../../errors';
import { registerMutation }     from '../registry';

const def = 'activate(activationCode: String!, firstName: String!, lastName: String!): String';

const activate = async (_, { activationCode: code, firstName, lastName }) => {
  if (typeof code !== 'string' || !code.length) {
    throw errors.MissingParameter.detail('code is required');
  }

  const pendingUser = await PendingUser.find(code);
  if (!pendingUser) {
    throw errors.InvalidParameterType.detail('Invalid code');
  }

  let user;
  const email = pendingUser.get('email');

  try {
    user = await User.create({
      firstName,
      lastName,
      email
    });
  } catch (err) {
    if (err === DuplicatedUser) {
      await pendingUser.cleanup();

      throw errors.BadRequest.detail('Duplicated user');
    }
    throw err;
  }

  if (!user) {
    throw errors.BadRequest;
  }

  const tokens = await user.getTokens();

  return JSON.stringify(tokens);
};

registerMutation(def, { activate });
