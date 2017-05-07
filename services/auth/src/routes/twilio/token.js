import twilio from 'twilio';
import oauth2 from '../../middlewares/oauth2';
import config from '../../config';

export const post = [
  oauth2,
  async (req, res) => {
    const capability = new twilio.Capability(config.twilio.accountSid, config.twilio.authToken);

    capability.allowClientOutgoing(config.twilio.twiMlAppSid);

    const token = capability.generate();

    res.send({ token });
  }
];
