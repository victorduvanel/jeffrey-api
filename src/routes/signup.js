import bodyParser  from 'body-parser';
import * as errors from '../errors';
import recaptcha   from '../services/recaptcha';

import PendingUser from '../models/pending-user';
import User        from '../models/user';

export const post = [
  bodyParser.urlencoded({ extended: false }),
  bodyParser.json(),
  async (req, res) => {
    const { body } = req;
    const { email, captcha, uri_prefix: uriPrefix } = body;
    const locale = body['device-locale'];
    const googleAuthToken = body['google-auth-token'];
    const facebookAuthToken = body['facebook-auth-token'];

    let iosAppToken = body['ios-app-token'] || null;

    if (iosAppToken !== '66744905-33BA-4279-9EBC-03F39E141C60') {
      iosAppToken = null;
    }

    if (iosAppToken && googleAuthToken) {
      const user = await User.googleAuthenticate(googleAuthToken);
      await user.saveMeta(body);

      res.send(await user.getTokens());
      return;
    }

    if (iosAppToken && facebookAuthToken) {
      const user = await User.facebookAuthenticate(facebookAuthToken);
      await user.saveMeta(body);

      res.send(await user.getTokens());
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
      await user.saveMeta(body);

      await user.sendLoginEmail(locale, uriPrefix);

      res.send({
        success: true,
        login_email_sent: true
      });

      return;
    }

    await PendingUser.createFromEmail(locale, email, uriPrefix);

    res.send({
      success: true,
      pending_user_created: true
    });
  }
];
