import request from 'request-promise';
import config  from '../config';

export const getToken = async (user) => {
  const res = await request({
    uri: `${config.chat.host}/users`,
    method: 'POST',
    json: true,
    body: {
      id: user.get('id'),
      attributes: {
        firstName: user.get('firstName'),
        lastName: user.get('lastName'),
        profilePicture: user.get('profilePicture')
      }
    }
  });

  if (res.success) {
    return res.token;
  }

  return null;
};

