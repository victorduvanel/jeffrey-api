import AccessToken      from '../models/access-token';
import { Unauthorized } from '../errors';

const oauth2 = async (req) => {
  let accessToken;

  let authorization = req.get('authorization');
  authorization = authorization.split(' ');

  if (authorization[0] !== 'Bearer') {
    throw Unauthorized;
  }

  authorization.shift();

  const token = authorization.join();


  accessToken = await AccessToken.find(token);

  if (!accessToken) {
    throw Unauthorized;
  }

  const user = accessToken.related('user');

  return { accessToken, user };
};

export default async (req, res, next) => {
  try {
    const{ accessToken, user } = await oauth2(req);

    if (user) {
      user.bumpLastActivity();
    }

    req.user = user;
    req.accessToken = accessToken;
    next();
  } catch (err) {
    next(err);
  }
};
