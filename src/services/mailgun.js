import request from 'request-promise';
import config from '../config';

export const sendEmail = ({ from, to, subject, message, attachment }) => {
  return request({
    method: 'POST',
    uri: `${config.mailgun.apiBaseURL}/messages`,

    auth: {
      user: 'api',
      pass: config.mailgun.apiKey
    },
    formData: {
      from,
      to,
      subject,
      html: message,
      attachment
    }
  });
};
