import bodyParser from 'body-parser';
import oauth2     from '../middlewares/oauth2';
import UserDevice from '../models/user-device';

export const post = [
  oauth2,
  bodyParser.json(),

  async (req, res) => {
    const { user } = req;
    const { token, type } = req.body;

    await UserDevice.create({ user, token, type });

    res.send({
      success: true
    });
  }
];
