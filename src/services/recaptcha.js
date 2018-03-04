import Promise from 'bluebird';
import request from 'request-promise';
import config  from '../config';

export default (token, ip) => {
  const form = {
    secret   : config.recaptcha.secretKey,
    response : token
  };

  if (config.PRODUCTION) {
    if (!ip) {
      return Promise.reject(new Error('ip argument not provided'));
    }

    form.remoteip = ip;
  }

  return request({
    method: 'POST',
    uri: 'https://www.google.com/recaptcha/api/siteverify',
    form
  })
    .then((res) => {
      res = JSON.parse(res);
      if (!res.success) {
        throw new Error('Captcha unverified');
      }
    });
};
