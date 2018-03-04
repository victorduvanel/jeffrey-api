import twilio from 'twilio';
import config from '../../config';

export const get = [
  (req, res) => {
    console.log(Object.keys(twilio));
  }
];
