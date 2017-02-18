import twilio from 'twilio';
import config from '../config';

const accountSid = config.twilio.accountSid;
const authToken = config.twilio.authToken;

export default twilio(accountSid, authToken);
