import bodyParser from 'body-parser';
import User from '../../models/user';

export const post = [
  bodyParser.json(),

  async (req, res) => {
    const { userId, notification } = req.body;

    const user = await User.find(userId);
    user.pushNotification(notification);
    res.send({
      success: true
    });
  }
];
