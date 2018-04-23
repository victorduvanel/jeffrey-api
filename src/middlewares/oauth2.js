import AccessToken      from '../models/access-token';
import { Unauthorized } from '../errors';

const oauth2 = async (req) => {
  let accessToken;

  let authorization = req.get('authorization');

  if (authorization) {
    authorization = authorization.split(' ');

    if (authorization[0] !== 'Bearer') {
      throw Unauthorized;
    }

    authorization.shift();

    const token = authorization.join();

    accessToken = await AccessToken.find(token);
  } else {
    const token = req.query.access_token;

    if (!token) {
      throw Unauthorized;
    }

    accessToken = await AccessToken.find(token);

    if (accessToken.get('singleUse')) {
      await accessToken.destroy();
    } else {
      throw Unauthorized;
    }
  }

  if (!accessToken) {
    throw Unauthorized;
  }

  const user = accessToken.related('user');

  return user;
};

export default async (req, res, next) => {
  oauth2(req)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch(next);
};
