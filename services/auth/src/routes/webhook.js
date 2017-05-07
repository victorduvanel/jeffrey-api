import twilioMiddleware from '../middlewares/twilio';
import bodyParser       from 'body-parser';
import { sendEmail }    from '../services/mailgun';
import { render }       from '../services/handlebars';

import PhoneNumber      from '../models/phone-number';
import Message          from '../models/message';

export const post = [
  bodyParser.urlencoded({ extended: false }),

  twilioMiddleware,

  async (req, res) => {
    const body  = req.body;
    const to    = await PhoneNumber.findOrCreate({ phoneNumber: body.To });
    const from  = await PhoneNumber.findOrCreate({ phoneNumber: body.From });
    let message = await Message.create({
      to, from, body: body.Body, sid: body.Sid
    });

    if (to.get('userId')) {
      await to.load('user');

      const user = to.related('user');

      message = await render('email/new-message', {
        to     : to.get('phoneNumber'),
        from   : from.get('phoneNumber'),
        message: message.get('body')
      });

      await sendEmail({
        to: user.get('email'),
        from: 'noreply@prestine.io',
        subject: 'Prestine: New Message',
        message
      });
    }

    res.set('Content-Type', 'application/xml');
    res.send('<?xml version="1.0" encoding="UTF-8" ?><Response></Response>');
  }
];
