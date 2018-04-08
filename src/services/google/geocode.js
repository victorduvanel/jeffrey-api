import request from 'request-promise';
// import config  from '../../config';

const geocode = async ({ lat, lng }) => {
  const latlng = `${lat},${lng}`;
  // @TODO: use key
  // const key = config.google.apiKey;

  const response = await request({
    method: 'GET',
    uri: `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}`
  });

  const payload = JSON.parse(response);

  if (payload.status === 'OK' && payload.results.length > 0) {
    const result = payload.results[0];
    const addressComponents = result.address_components;

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

export default geocode;
