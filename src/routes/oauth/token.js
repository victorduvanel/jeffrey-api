import basicAuth  from 'basic-auth';
import bodyParser from 'body-parser';
import User       from '../../models/user';
import LoginToken from '../../models/login-token';
import { AppError, Unauthorized, BadRequest, InvalidUserCredentials } from '../../errors';


export const post = [
  bodyParser.urlencoded({ extended: false }),

  async (req, res) => {
    const auth = basicAuth(req);

    if (!auth) {
      throw Unauthorized;
    }

    if (auth.name !== '0e7814b6-b793-44f5-aab0-9644be51f1ae' || auth.pass !== '') {
      throw Unauthorized;
    }

    const { grant_type, username, password } = req.body;

    if (grant_type === 'login-token') {
      const { token } = req.body;

      const loginToken = await LoginToken.find(token);
      if (!loginToken) {
        throw Unauthorized;
      }

      const user = loginToken.related('user');
      if (!user) {
        throw Unauthorized;
      }

      await loginToken.destroy();

      await user.saveMeta(req.body);

      const accessToken = await user.createAccessToken({});
      res.send({
        access_token: accessToken.get('token'),
        token_type: 'Bearer'
      });

      return;
    }

    if (grant_type !== 'password') {
      throw BadRequest;
    }

    try {
      const user = await User.authenticate({ email: username, password });
      await user.saveMeta(req.body);

      const accessToken = await user.createAccessToken({});

      res.send({
        access_token: accessToken.get('token'),
        token_type: 'Bearer'
      });
    } catch (err) {
      if (err instanceof AppError && err.message === 'Invalid Credentials') {
        throw InvalidUserCredentials;
      } else {
        throw err;
      }
    }
  }
];
