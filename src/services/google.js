import request from 'request-promise';

const verifyToken = async (token) => {
  const response = await request({
    method: 'POST',
    uri: 'https://www.googleapis.com/oauth2/v3/tokeninfo',
    form: {
      id_token: token
    }
  });

  const payload = JSON.parse(response);

  return {
    id: payload.sub,
    email: payload.email,
    firstName: payload.given_name,
    lastName: payload.family_name,
    verified: payload.email_verified === 'true'
  };
};

export default { verifyToken };
