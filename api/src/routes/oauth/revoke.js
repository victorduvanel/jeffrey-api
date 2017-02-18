import basicAuth   from 'basic-auth';
import * as errors      from '../../errors';
import bodyParser  from 'body-parser';
import AccessToken from '../../models/access-token';

export const post = [
  bodyParser.urlencoded({ extended: false }),

  async (req, res) => {
    const auth = basicAuth(req);

    if (!auth) {
      throw errors.Unauthorized;
    }

    if (auth.name !== '0e7814b6-b793-44f5-aab0-9644be51f1ae' || auth.pass !== '') {
      throw errors.Unauthorized;
    }

    const { token } = req.body;

    if (typeof token !== 'string' || token.length < 1) {
      throw errors.BadRequest;
    }

    const accessToken = await AccessToken.find(token);

    if (!accessToken) {
      throw errors.ResourceNotFound;
    }

    await accessToken.destroy();

    res.send({
      success: true
    });
  }
];
