import bodyParser        from 'body-parser';
import twilioMiddleware  from '../../middlewares/twilio';
import AccessToken       from '../../models/access-token';
import PhoneNumber       from '../../models/phone-number';
import VoiceConversation from '../../models/voice-conversation';

const ringing = async (req, res) => {
  let { token, toNumber, fromNumber } = req.body;
  const callSid = req.body.CallSid;

  if (!token) {
    return res
      .type('text/plain')
      .status(400)
      .send('Token is missing.');
  }

  token = await AccessToken.find(token);
  if (!token) {
    return res
      .type('text/plain')
      .status(403)
      .send('Token invalid.');
  }

  const user = token.related('user');

  fromNumber = await PhoneNumber
    .forge({ phoneNumber: fromNumber})
    .fetch({
      withRelated: ['user']
    });

  if (!fromNumber || fromNumber.related('user').get('id') !== user.get('id')) {
    return res
      .type('text/plain')
      .status(403)
      .send('From number invalid.');
  }

  toNumber = await PhoneNumber.findOrCreate({ phoneNumber: toNumber });

  await VoiceConversation.create({
    to  : toNumber,
    from: fromNumber,
    sid : callSid
  });

  res.set('Content-Type', 'application/xml');
  res.send([
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<Response>',
    `<Dial callerId="${fromNumber.get('phoneNumber')}" method="POST" action="https://api.prestine.io/twilio/hook">`,
    toNumber.get('phoneNumber'),
    '</Dial>',
    '</Response>'
  ].join(''));
};

const completed = async (req, res) => {
  const sid = req.body.CallSid;

  const voiceConversation = await VoiceConversation.forge({ sid }).fetch();
  if (!VoiceConversation) {
    return res
      .type('text/plain')
      .status(400)
      .send('Invalid sid.');
  }

  const duration = req.body.DialCallDuration;

  voiceConversation.set('duration', duration);
  await voiceConversation.save();

  res.set('Content-Type', 'application/xml');
  res.send([
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<Response></Response>'
  ].join(''));
};

export const post = [
  bodyParser.urlencoded({ extended: false }),

  twilioMiddleware,

  async (req, res) => {
    const body = req.body;
    const callStatus = body.CallStatus;

    switch (callStatus) {
      case 'ringing':
        return ringing(req, res);
      case 'completed':
        return completed(req, res);
      default:
        return res
          .type('text/plain')
          .status(400)
          .send('Invalid status.');
    }
  }
];
