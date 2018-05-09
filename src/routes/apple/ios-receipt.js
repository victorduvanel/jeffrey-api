import bodyParser from 'body-parser';
import AppleIosReceipt from '../../models/apple-ios-receipt';
import oauth2     from '../../middlewares/oauth2';

export const post = [
  oauth2,
  bodyParser.json(),

  async (req, res) => {
    const user = req.user;
    const { receipt } = req.body;

    await AppleIosReceipt.create({ receipt, user });

    res.send({ success: true });
  }
];
