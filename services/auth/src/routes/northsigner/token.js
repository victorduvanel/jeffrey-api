import bodyParser       from 'body-parser';
import * as northsigner from '../../services/northsigner';
import User             from '../../models/user';
import * as errors      from '../../errors';

export const post = [
  bodyParser.urlencoded({ extended: false }),

  async (req, res) => {
    let authorizationId = req.body.authorization_id;

    if (!authorizationId || authorizationId < 1) {
      throw errors.BadRequest;
    }

    const nsRes = await northsigner.findAuthorization(authorizationId);
    if (nsRes.status === 'granted') {
      const user = await User.forge({ id: nsRes.account_id })
      .fetch();

      if (!user) {
        throw errors.Unauthorized;
      }

      const accessToken = await user.createAccessToken();

      res.send({
        access_token: accessToken.get('token'),
        token_type: 'Bearer'
      });
    } else {
      throw errors.Unauthorized;
    }
  }
];
