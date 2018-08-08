import bodyParser                  from 'body-parser';
import PhoneNumberVerificationCode from '../models/phone-number-verification-code';
import User                        from '../models/user';

export const post = [
  bodyParser.json(),
  async (req, res) => {
    const phoneNumber = req.body['phone-number'];
    await PhoneNumberVerificationCode.create({
      phoneNumber,
      ip: req.ip
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
        const accessToken = await user.createAccessToken();
        res.send({
          access_token: accessToken.get('token'),
          token_type: 'Bearer'
        });
        return;
      }

      res.send({
        success: false
      });
    }
  ]
};
