import bodyParser from 'body-parser';
import * as errors from '../errors';
import PendingUser from '../models/pending-user';
import User, { DuplicatedUser } from '../models/user';

export const post = [
  bodyParser.json(),

  async (req, res) => {
    const code = req.params.code;

    if (typeof code !== 'string' || !code.length) {
      throw errors.MissingParameter.detail('code is required');
    }

    const pendingUser = await PendingUser.find(code);
    if (!pendingUser) {
      throw errors.InvalidParameterType.detail('Invalid code');
    }

    let user;
    const email = pendingUser.get('email');
    const { firstName, lastName } = req.body;

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

    const token = await user.createAccessToken({});

    await pendingUser.cleanup();

    res.send({
      email,
      access_token: token.get('token')
    });
  }
];
