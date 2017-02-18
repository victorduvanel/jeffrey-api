import bodyParser from 'body-parser';
import oauth2  from '../middlewares/oauth2';
import Message from '../models/message';
import PhoneNumber from '../models/phone-number';
import twilio  from '../services/twilio';
import { Unauthorized } from '../errors';

export const post = [
  oauth2,
  bodyParser.urlencoded({ extended: false }),

  async (req, res) => {
    const user = req.user;
    const { to, from, message } = req.body;

    let phoneNumber = await PhoneNumber
      .forge({
        phoneNumber: from,
        userId: user.get('id')
      })
      .fetch();

    if (!phoneNumber) {
      throw Unauthorized;
    }

    const sms = await twilio.messages.create({
      body: message,
      to,
      from
    });

    const toPhoneNumber = await PhoneNumber.findOrCreate({ phoneNumber: to });
    const fromPhoneNumber = await PhoneNumber.findOrCreate({ phoneNumber: from });
    await Message.create({
      to: toPhoneNumber,
      from: fromPhoneNumber,
      body: message,
      sid: sms.sid
    });

    res.send({
      success: true
    });

  }
];
