import bodyParser from 'body-parser';
import twilio from 'twilio';
import config from '../../config';

export const post = [
  bodyParser.urlencoded({ extended: false }),

  twilio.webhook(config.twilio.authToken, {
    host: config.host,
    protocol: config.protocol
  }),

  (req, res, next) => {
    const body = req.body;
    const callStatus = body.CallStatus;

    if (body.Direction === 'inbound') {
      switch (callStatus) {
        case 'ringing':

          res.set('Content-Type', 'application/xml');
          res.send([
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<Response>',
            `<Dial callerId="+33644641618" method="POST" action="${config.protocol}://${config.host}/twilio/webhook">`,
            '+33651648566',
            //'<Client>voice_test</Client>',
            '</Dial>',
            '</Response>'
          ].join(''));

          break;
        case 'completed':
          res.set('Content-Type', 'application/xml');
          res.send([
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<Response></Response>'
          ].join(''));
          break;
        default:
          res
            .type('text/plain')
            .status(400)
            .send('Invalid status.');
      }
    } else if (body.Direction === 'outbound') {

      switch (callStatus) {
        case 'ringing':
          res.set('Content-Type', 'application/xml');
          res.send([
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<Response>',
            `<Dial callerId="+33644641618" method="POST" action="${config.protocol}://${config.host}/twilio/webhook">`,
            '+33157225400',
            '</Dial>',
            '</Response>'
          ].join(''));
          break;
        case 'completed':
          res.set('Content-Type', 'application/xml');
          res.send([
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<Response></Response>'
          ].join(''));
          break;
        default:
          res
            .type('text/plain')
            .status(400)
            .send('Invalid status.');
      }
    } else {
      res
        .type('text/plain')
        .status(400)
        .send('Invalid status.');
    }
  }
];
