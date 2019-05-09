import bodyParser from 'body-parser';
import User from '../../models/user';

export const post = [
  bodyParser.json(),

  async (req, res) => {
    const { userId, conversationIds } = req.body;

    const user = await User.find(userId);
    user.setBadge(conversationIds.length);

    res.send({
      success: true
    });
  }
];
