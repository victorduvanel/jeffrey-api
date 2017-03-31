import bodyParser       from 'body-parser';
import uuid             from 'uuid';
import twilio           from '../services/twilio';
import oauth2           from '../middlewares/oauth2';
import Conversation     from '../models/conversation';
import PhoneNumber      from '../models/phone-number';
import Message          from '../models/message';
import { Unauthorized } from '../errors';
import config           from '../config';

const conversations = [{
  id: '8F50B367-ABB3-421A-9B7E-E9B15FC29DC8',
  to: '+33651648566',
  from: '+33656655665',
  name: 'Second Conv'
}, {
  id: 'AAA26940-3946-46AE-A884-CB5FB3CDA6BF',
  to: '+33651648566',
  from: '+33656655665',
  name: 'First Conv'
}, {
  id: '8F50B367-ABB3-421A-9B7E-E9B15FC29DC9',
  to: '+33651648566',
  from: '+33656655665',
  name: 'Second Conv'
}, {
  id: 'AAA26940-3946-46AE-A884-CB5FB3CDA6B0',
  to: '+33651648566',
  from: '+33656655665',
  name: 'First Conv'
}, {
  id: '8F50B367-ABB3-421A-9B7E-E9B15FC29DD9',
  to: '+33651648566',
  from: '+33656655665',
  name: 'Second Conv'
}, {
  id: 'AAA26940-3946-46AE-A884-CB5FB3CDB6B0',
  to: '+33651648566',
  from: '+33656655665',
  name: 'First Conv'
},
];

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
        body: message,
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
        to: toPhoneNumber,
        from: fromPhoneNumber
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
    res.send({
      data: conversations.map((conversation) => {
        return {
          id: conversation.id,
          type: 'conversation',
          attributes: {
            to: conversation.to,
            from: conversation.from,
            name: conversation.name
          }
        };
      })
    });
  }
];

export const getOne = [
  oauth2,

  async (req, res) => {
    const conversationId = req.params.conversation_id;

    const conversation = conversations.find((conversation) => {
      return conversation.id === conversationId;
    });

    if (!conversation) {
      res.status(404);
    } else {
      res.send({
        data: {
          id: conversation.id,
          type: 'conversation',
          attributes: {
            to: conversation.to,
            from: conversation.from,
            name: conversation.name
          }
        }
      });
    }
  }
];
