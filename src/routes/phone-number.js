import bodyParser                  from 'body-parser';
import PhoneNumberVerificationCode from '../models/phone-number-verification-code';
import User                        from '../models/user';
import { Unauthorized }            from '../errors';

export const post = [
  bodyParser.json(),
  async (req, res) => {
    const phoneNumber = req.body['phone-number'];
    await PhoneNumberVerificationCode.create({
      phoneNumber,
      ip: req.ip,
      intl: req.intl
    });
    res.send({ success: true });
  }
];

export const verify = {
  post: [
    bodyParser.json(),
    async (req, res) => {
      const phoneNumber = req.body['phone-number'];
      const verificationCode = req.body.code;

      if (await PhoneNumberVerificationCode.verify({
        phoneNumber,
        verificationCode
      })) {
        const user = await User.findOrCreateFromPhoneNumber(phoneNumber);
        res.send(await user.getTokens());
        return;
      }

      throw Unauthorized;
    }
  ]
};
