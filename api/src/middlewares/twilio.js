import twilio from 'twilio';
import config from '../config';

const middleware = twilio.webhook(config.twilio.authToken, {
  host: config.host,
  protocol: config.protocol
});

export default middleware;
