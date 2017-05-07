import bodyParser       from 'body-parser';
import * as northsigner from '../../services/northsigner';
import AccessToken      from '../../models/access-token';
import * as errors      from '../../errors';

export const post = [
  bodyParser.urlencoded({ extended: false }),

  async (req, res) => {
    let authorization = req.get('authorization');

    if (!authorization) {
      throw errors.Unauthorized;
    }

    authorization = authorization.split(' ');

    if (authorization[0] !== 'Bearer') {
      throw errors.Unauthorized;
    }

    authorization.shift();

    const token = authorization.join();

    const accessToken = await AccessToken.find(token);

    if (!accessToken) {
      throw errors.Unauthorized;
    }

    const user = accessToken.related('user');
    let authorizationId = req.body.authorization_id;

    if (!authorizationId || authorizationId < 1) {
      throw errors.BadRequest;
    }

    const nsRes = await northsigner
      .registerAccount(authorizationId, user.get('id'));

    console.log(nsRes);
    res.send({ success: true });
  }
];
