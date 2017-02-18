import bodyParser  from 'body-parser';
import * as errors from '../errors';
import recaptcha   from '../services/recaptcha';

import PendingUser from '../models/pending-user';

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

    return PendingUser.createFromEmail(email)
      .then(() => {
        return res.send({
          success: true
        });
      })
      .catch(errors.EmailRejected, () => {
        res.send({
          success: true
        });
      });
  }
];
