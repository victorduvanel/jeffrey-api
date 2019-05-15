import bodyParser                  from 'body-parser';
import { RateLimiterRedis }        from 'rate-limiter-flexible';
import redisClient                 from '../services/redis';
import PhoneNumberVerificationCode from '../models/phone-number-verification-code';
import User                        from '../models/user';
import { Unauthorized }            from '../errors';

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient.pub,
  points: 2,
  duration: 2 * 60,
  keyPrefix: 'rlflx-phone-number'
});

export const post = [
  bodyParser.json(),

  async (req, res, next) => {
    try {
      await rateLimiter.consume(req.ip, 1);
      next();
    } catch (err) {
      res.status(429).end();
    }
  },

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
