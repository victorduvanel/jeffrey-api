import bodyParser       from 'body-parser';
import uuid             from 'uuid';
import config           from '../config';
import oauth2           from '../middlewares/oauth2';
import Message          from '../models/message';
import Conversation     from '../models/conversation';
import PhoneNumber      from '../models/phone-number';
import twilio           from '../services/twilio';

export const post = [
  oauth2,
  bodyParser.urlencoded({ extended: false }),

  async (req, res) => {
    const user = req.user;
    const conversationId = req.body.conversation_id;
    const messageContent = req.body.message;

    const conversation = await Conversation.find(conversationId);

    console.log(conversation);

    return;

    let sid;
    if (config.PRODUCTION) {
      const sms = await twilio.messages.create({
        body: message,
        to,
        from
      });
      sid = sms.sid;
    } else {
      sid = uuid.v4();
    }

    const toPhoneNumber = await PhoneNumber.findOrCreate({ phoneNumber: to });
    const fromPhoneNumber = await PhoneNumber.findOrCreate({ phoneNumber: from });
    const message = await Message.create({
      to: toPhoneNumber,
      from: fromPhoneNumber,
      body: messageContent,
      sid
    });

    await toPhoneNumber.load('user');
    await fromPhoneNumber.load('user');

    const toUser = toPhoneNumber.related('user');
    const fromUser = fromPhoneNumber.related('user');

    if (toUser) {
      const conversation = Conversation.findOrCreate({
        user: toUser,
        to: toPhoneNumber,
        from: fromPhoneNumber
      });

      await conversation.incoming(message);
    }

    if (fromUser) {
      const conversation = Conversation.findOrCreate({
        user: fromUser,
        to: toPhoneNumber,
        from: fromPhoneNumber
      });

      await conversation.outgoing(message);
    }

    res.send({
      success: true
    });
  }
];

export const get = [
  oauth2,
  async (req, res) => {
    // const conversationId = req.query.conversation_id;

    res.send({
      data: [{
        id: '0E2B6C3A-239B-48F2-8677-5FDF001E4597',
        type: 'message',
        attributes: {
          message: 'hello world!',
          type: 'outgoing'
        }
      }, {
        id: '0E2B8C3A-239B-48F2-8677-5FDF001E4597',
        type: 'message',
        attributes: {
          message: 'How are you doing:',
          type: 'incoming'
        }
      }, {
        id: '1E2B8C3A-239B-48F2-8677-5FDF001E4597',
        type: 'message',
        attributes: {
          message: 'I am good and you?',
          type: 'outgoing'
        }
      }]
    });
  }
];
