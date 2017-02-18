import bodyParser     from 'body-parser';
import { sendEmail }  from '../services/mailgun';
import { render }     from '../services/handlebars';

import PhoneNumber    from '../models/phone-number';
import Message        from '../models/message';

export const post = [
  bodyParser.urlencoded({ extended: false }),

  async (req, res) => {
    const body  = req.body;
    const to    = await PhoneNumber.findOrCreate({ phoneNumber: body.To });
    const from  = await PhoneNumber.findOrCreate({ phoneNumber: body.From });
    let message = await Message.create({
      to, from, body: body.Body, sid: body.Sid
    });

    await to.load('users');

    const users = to.related('users').map((user) => user.get('email'));

    if (users.length) {
      message = await render('email/new-message', {
        to     : to.get('phoneNumber'),
        from   : from.get('phoneNumber'),
        message: message.get('body')
      });

      await sendEmail({
        to: users.join(),
        from: 'noreply@prestine.io',
        subject: 'Prestine: New Message',
        message
      });
    }

    res.set('Content-Type', 'application/xml');
    res.send('<?xml version="1.0" encoding="UTF-8" ?><Response></Response>');
  }
];
