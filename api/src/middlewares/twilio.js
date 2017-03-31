import twilio from 'twilio';
import config from '../config';

const middleware = twilio.webhook(config.twilio.authToken, {
  host: 'eb9cc133.ngrok.io',
  protocol: 'https'
  //host: config.host,
  //protocol: config.protocol
});

export default middleware;
