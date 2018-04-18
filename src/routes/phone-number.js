import oauth2     from '../middlewares/oauth2';
import bodyParser from 'body-parser';
import PhoneNumberVerificationCode from '../models/phone-number-verification-code';

export const post = [
  oauth2,
  bodyParser.json(),
  async (req, res) => {
    const { user } = req;
    const phoneNumber = req.body['phone-number'];
    await PhoneNumberVerificationCode.create({
      user,
      phoneNumber,
      ip: req.ip
    });
    res.send({ success: true });
  }
];

export const verify = {
  post: [
    oauth2,
    bodyParser.json(),
    async (req, res) => {
      const { user } = req;
      const phoneNumber = req.body['phone-number'];
      const verificationCode = req.body.code;

      const success = await PhoneNumberVerificationCode.verify({
        user,
        phoneNumber,
        verificationCode
      });
      res.send({ success });
    }
  ]
};
