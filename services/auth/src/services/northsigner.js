import request from 'request-promise';
import config  from '../config';

//const NORTHSIGNER_API = 'http://localhost:3000';
const NORTHSIGNER_API = 'https://api.northsigner.com';

export const findAuthorization = (authorizationId) => {
  authorizationId = encodeURIComponent(authorizationId);
  const url = `${NORTHSIGNER_API}/authorization/${authorizationId}`;

  return request({
    url,
    auth: {
      user: config.northsigner.appId,
      pass: config.northsigner.appSecret
    }
  })
    .then((res) => JSON.parse(res));
};

export const registerAccount = (authorizationId, userId) => {
  authorizationId = encodeURIComponent(authorizationId);
  const url = `${NORTHSIGNER_API}/account`;

  return request({
    url,
    method: 'POST',
    auth: {
      user: config.northsigner.appId,
      pass: config.northsigner.appSecret
    },
    form: {
      authorization_id: authorizationId,
      account_id: userId
    }
  })
    .then((res) => JSON.parse(res));
};
