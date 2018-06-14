import bodyParser from 'body-parser';
import oauth2     from '../middlewares/oauth2';
import UserDevice from '../models/user-device';

export const post = [
  oauth2,
  bodyParser.json(),

  async (req, res) => {
    const { user, body } = req;
    const deviceToken = body['device-token'];
    const deviceType = body['device-type'];

    if (deviceToken && deviceType) {
      await UserDevice.revoke(user, deviceToken, deviceType);
    }

    if (req.accessToken) {
      await req.accessToken.destroy();
    }

    res.send({ success: true });
  }
];
