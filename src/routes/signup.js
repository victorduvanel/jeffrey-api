import bodyParser  from 'body-parser';
import * as errors from '../errors';
import recaptcha   from '../services/recaptcha';

import localized   from '../middlewares/localized';
import PendingUser from '../models/pending-user';
import User        from '../models/user';

export const post = [
  bodyParser.urlencoded({ extended: false }),
  bodyParser.json(),
  localized,
  async (req, res) => {
    const { body } = req;
    const { email, captcha } = body;
    const googleAuthToken = body['google-auth-token'];
    const facebookAuthToken = body['facebook-auth-token'];

    let iosAppToken = body['ios-app-token'] || null;

    if (iosAppToken !== '66744905-33BA-4279-9EBC-03F39E141C60') {
      iosAppToken = null;
    }

    if (iosAppToken && googleAuthToken) {
      const user = await User.googleAuthenticate(googleAuthToken);
      const accessToken = await user.createAccessToken({});

      res.send({
        access_token: accessToken.get('token'),
        token_type: 'Bearer'
      });
      return;
    }

    if (iosAppToken && facebookAuthToken) {
      const user = await User.facebookAuthenticate(facebookAuthToken);
      const accessToken = await user.createAccessToken({});

      res.send({
        access_token: accessToken.get('token'),
        token_type: 'Bearer'
      });
      return;
    }

    if (typeof email !== 'string' || !email.length) {
      throw errors.MissingParameter.detail('email is required');
    }

    if (!iosAppToken) {
      if (typeof captcha !== 'string' || !captcha.length) {
        throw errors.MissingParameter.detail('captcha is required');
      }

      try {
        await recaptcha(captcha, req.ip);
      } catch (err) {
        throw errors.MissingParameter.detail('captcha is not valid');
      }
    }

    const user = await User.forge({ email }).fetch();

    if (user) {
      // throw errors.BadRequest.detail('email already used');
      await user.sendLoginEmail(req.i18n);

      res.send({
        success: true,
        login_email_sent: true
      });

      return;
    }

    await PendingUser.createFromEmail(req.i18n, email);

    res.send({
      success: true,
      pending_user_created: true
    });
  }
];
