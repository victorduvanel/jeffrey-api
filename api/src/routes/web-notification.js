import bodyParser      from 'body-parser';
import oauth2          from '../middlewares/oauth2';
import WebNotification from '../models/web-notification';

export const post = [
  oauth2,
  bodyParser.urlencoded({ extended: false }),

  async (req, res) => {
    const user = req.user;
    const { payload } = req.body;

    const webNotification = await WebNotification.create({ user, payload });

    webNotification.notify('welcome');

    res.send({ success: true });
  }
];
