import request from 'request-promise';
import config  from '../config';

export default async (token, ip) => {
  const form = {
    secret   : config.recaptcha.secretKey,
    response : token
  };

  if (config.PRODUCTION) {
    if (!ip) {
      throw new Error('ip argument not provided');
    }

    form.remoteip = ip;
  }

  let res = await request({
    method: 'POST',
    uri: 'https://www.google.com/recaptcha/api/siteverify',
    form
  });
  res = JSON.parse(res);
  if (!res.success) {
    throw new Error('Captcha unverified');
  }
  return res;
};
