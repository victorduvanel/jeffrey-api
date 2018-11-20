import mailjet from 'node-mailjet';
import config from '../config';

const client = mailjet.connect(config.mailjet.apikeyPulic, config.mailjet.apikeyPrivate);

export const sendEmail = (opts) => {
  const request = client
    .post('send', { version: 'v3.1' })
    .request(opts);

  return request;
};
