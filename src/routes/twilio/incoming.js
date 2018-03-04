import bodyParser from 'body-parser';
import twilio from 'twilio';
import config from '../../config';

const handler = (req, res, next) => {
  const resp = new twilio.twiml.VoiceResponse();
  resp.say('Congratulations! You have received your first inbound call! Good bye.');
  res.send(resp.toString());
};

export const post = [ handler ];

export const get = [ handler ];
