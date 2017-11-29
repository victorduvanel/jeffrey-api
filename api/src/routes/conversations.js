import bodyParser       from 'body-parser';
import uuid             from 'uuid';
import twilio           from '../services/twilio';
import oauth2           from '../middlewares/oauth2';
import Conversation     from '../models/conversation';
import PhoneNumber      from '../models/phone-number';
import Message          from '../models/message';
import { Unauthorized } from '../errors';
import config           from '../config';

export const post = [
  oauth2,
  bodyParser.urlencoded({ extended: false }),

  async (req, res) => {
    const user = req.user;
    const { to, from } = req.body;
    const messageContent = req.body.message;

    const fromPhoneNumber = await PhoneNumber
      .forge({
        phoneNumber: from,
        userId: user.get('id')
      })
      .fetch();

    if (!fromPhoneNumber) {
      throw Unauthorized;
    }

    let sid;
    if (config.PRODUCTION) {
      const sms = await twilio.messages.create({
        body: messageContent,
        to,
        from
      });
      sid = sms.sid;
    } else {
      sid = uuid.v4();
    }

    const toPhoneNumber = await PhoneNumber.findOrCreate({ phoneNumber: to });
    const message = await Message.create({
      to: toPhoneNumber,
      from: fromPhoneNumber,
      body: messageContent,
      sid
    });

    if (toPhoneNumber.get('userId')) {
      await toPhoneNumber.load('user');

      const toUser = toPhoneNumber.related('user');
      const peerConversation = await Conversation.findOrCreate({
        user: toUser,
        from: toPhoneNumber,
        to: fromPhoneNumber
      });

      await peerConversation.incoming(message);
    }

    const conversation = await Conversation.findOrCreate({
      user,
      to: toPhoneNumber,
      from: fromPhoneNumber
    });

    await conversation.outgoing(message);

    res.send({
      conversation_id: conversation.get('id')
    });
  }
];

export const get = [
  oauth2,

  async (req, res) => {
    const user = req.user;

    await user.load([
      'conversations',
      'conversations.to',
      'conversations.from'
    ]);

    const conversations = user.related('conversations');

    const responseData = conversations.map((conversation) => {
      const toPhoneNumber = conversation.related('to');
      const fromPhoneNumber = conversation.related('from');

      return {
        id: conversation.get('id'),
        type: 'conversation',
        attributes: {
          to: toPhoneNumber.get('phoneNumber'),
          from: fromPhoneNumber.get('phoneNumber'),
          name: conversation.get('name') || ''
        }
      };
    });

    res.send({
      data: responseData
    });
  }
];

export const getOne = [
  oauth2,

  async (req, res) => {
    const user = req.user;
    const conversationId = req.params.conversation_id;

    const conversation = await Conversation.find({
      id: conversationId,
      user
    });

    if (!conversation) {
      res.status(404);
    } else {

      await conversation.load(['to', 'from']);

      const toPhoneNumber = conversation.related('to');
      const fromPhoneNumber = conversation.related('from');

      res.send({
        data: {
          id: conversation.get('id'),
          type: 'conversation',
          attributes: {
            to: toPhoneNumber.get('phoneNumber'),
            from: fromPhoneNumber.get('phoneNumber'),
            name: conversation.get('name') || ''
          }
        }
      });
    }
  }
];
