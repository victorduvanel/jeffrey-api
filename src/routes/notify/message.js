import bodyParser from 'body-parser';
import User from '../../models/user';

export const post = [
  bodyParser.json(),

  async (req, res) => {
    const { userId, notification } = req.body;

    const u = await User.find(userId);
    u.pushNotification(notification);
    res.send({
      success: true
    });
  }
];
