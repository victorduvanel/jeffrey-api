import bodyParser       from 'body-parser';
import uuid             from 'uuid';
import config           from '../config';
import oauth2           from '../middlewares/oauth2';
import Message          from '../models/message';
import Conversation     from '../models/conversation';
import twilio           from '../services/twilio';

export const post = [
  oauth2,
  bodyParser.urlencoded({ extended: false }),

  async (req, res) => {
    const user = req.user;
    const conversationId = req.body.conversation_id;
    const messageContent = req.body.message;

    const conversation = await Conversation.find({
      id: conversationId,
      user
    });

    if (!conversation) {
      res.status(404);
      return;
    }

    await conversation.load(['to', 'from']);

    const toPhoneNumber = conversation.related('to');
    const fromPhoneNumber = conversation.related('from');

    let sid;
    if (config.PRODUCTION) {
      const sms = await twilio.messages.create({
        body: message,
        to: toPhoneNumber.get('phoneNumber'),
        from: fromPhoneNumber.get('phoneNumber')
      });
      sid = sms.sid;
    } else {
      sid = uuid.v4();
    }

    const message = await Message.create({
      to: toPhoneNumber,
      from: fromPhoneNumber,
      body: messageContent,
      sid
    });

    if (toPhoneNumber.get('userId')) {
      await toPhoneNumber.load('user');

      const toUser = toPhoneNumber.related('user');
      const conversation = await Conversation.findOrCreate({
        user: toUser,
        from: toPhoneNumber,
        to: fromPhoneNumber
      });

      await conversation.incoming(message);
    }

    await conversation.outgoing(message);

    res.send({
      success: true
    });
  }
];

export const get = [
  oauth2,
  async (req, res) => {
    const conversationId = req.query.conversation_id;
    const user = req.user;

    const conversation = await Conversation.find({
      id: conversationId,
      user
    });

    await conversation.load(['conversationMessages.message']);
    const conversationMessages = conversation.related('conversationMessages');

    const responseData = conversationMessages.map((conversationMessage) => {
      const message = conversationMessage.related('message');

      return {
        id: message.get('id'),
        type: 'message',
        attributes: {
          message: message.get('body'),
          type: conversationMessage.get('type'),
          date: message.get('createdAt')
        }
      };
    });

    res.send({
      data: responseData
    });
  }
];
