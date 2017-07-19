import bodyParser from 'body-parser';
import AppleIosReceipt from '../../models/apple-ios-receipt';
import oauth2     from '../../middlewares/oauth2';

export const post = [
  oauth2,
  bodyParser.json(),

  async (req, res) => {
    const user = req.user;
    const { receipt } = req.body;

    console.log(receipt);
    console.log(user.get('id'));

    const receipts = await AppleIosReceipt.create({ receipt, user });

    res.send({ success: true });
  }
];
