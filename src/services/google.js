import request from 'request-promise';
import config  from '../config';

export const geocode = async ({ lat, lng }) => {
  const latlng = `${lat},${lng}`;
  const key = config.google.apiKey;

  const response = await request({
    method: 'GET',
    uri: `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}`
  });

  const payload = JSON.parse(response);

  if (payload.status === 'OK' && payload.results.length > 0) {
    const result = payload.results[0];
    const addressComponents = result.address_components;

    console.log(addressComponents);

    let country, locality;
    for (const component of addressComponents) {
      if (component.types.includes('country')) {
        country = component.short_name;
      } else if (component.types.includes('locality')) {
        locality = component.long_name;
      }
    }

    return {
      country, locality
    };
  }

  return null;
};

export const verifyToken = async (token) => {
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
