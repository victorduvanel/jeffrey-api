import basicAuth  from 'basic-auth';
import bodyParser from 'body-parser';
import User       from '../../models/user';
import { Unauthorized, BadRequest } from '../../errors';

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

    if (grant_type !== 'password') {
      throw BadRequest;
    }

    const user = await User.authenticate({ email: username, password });

    const accessToken = await user.createAccessToken({});

    res.send({
      access_token: accessToken.get('token'),
      token_type: 'Bearer'
    });
  }
];
