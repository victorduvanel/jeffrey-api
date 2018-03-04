import request from 'request-promise';
import config from '../config';

export const sendEmail = ({ from, to, subject, message }) => {
  return request({
    method: 'POST',
    uri: `${config.mailgun.apiBaseURL}/messages`,
    auth: {
      user: 'api',
      pass: config.mailgun.apiKey
    },
    form: {
      from,
      to,
      subject,
      html: message
    }
  });
};
