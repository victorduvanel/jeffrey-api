import request from 'request-promise';
import config from '../config';

export const sendEmail = ({ from, to, subject, message, attachment }) => {
  const formData = {
    from,
    to,
    subject,
    html: message,
  };

  if (attachment) {
    formData.attachment = attachment;
  }

  return request({
    method: 'POST',
    uri: `${config.mailgun.apiBaseURL}/messages`,
    formData,
    auth: {
      user: 'api',
      pass: config.mailgun.apiKey
    }
  });
};
