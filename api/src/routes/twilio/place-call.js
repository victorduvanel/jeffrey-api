import twilio from 'twilio';
import config from '../../config';

export const get = [
  (req, res, next) => {
    console.log(Object.keys(twilio));
  }
];
