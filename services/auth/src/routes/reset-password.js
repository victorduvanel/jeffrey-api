import bodyParser  from 'body-parser';
import * as errors from '../errors';
import recaptcha   from '../services/recaptcha';

import User from '../models/user';
import ResetPasswordToken from '../models/reset-password-token';

export const post = [
  bodyParser.urlencoded({ extended: false }),
  async (req, res) => {
    const { email, captcha } = req.body;

    if (typeof email !== 'string' || !email.length) {
      throw errors.MissingParameter.detail('email is required');
    }

    if (typeof captcha !== 'string' || !captcha.length) {
      throw errors.MissingParameter.detail('captcha is required');
    }

    try {
      await recaptcha(captcha, req.ip);
    } catch (err) {
      throw errors.MissingParameter.detail('captcha is not valid');
    }

    const user = await User.forge({ email }).fetch();

    if (user) {
      await ResetPasswordToken.create({ user });
    }

    res.send({
      success: true
    });
  }
];

export const get = [
  async (req, res) => {
    const { token } = req.params;
    const resetPasswordToken = await ResetPasswordToken.find(token);

    if (!resetPasswordToken) {
      throw errors.NotFound;
    }

    await resetPasswordToken.load('user');

    const user = resetPasswordToken.related('user');
    const accessToken = await user.createAccessToken({ singleUse: true });

    await resetPasswordToken.destroy();

    res.send({
      access_token: accessToken.get('token'),
      token_type: 'Bearer'
    });
  }
];
