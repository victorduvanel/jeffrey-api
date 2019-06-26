import request from 'request-promise';
import config  from '../../config';

const geocode = async ({ lat, lng }) => {
  const response = await request({
    method: 'GET',
    uri: 'https://maps.googleapis.com/maps/api/geocode/json',
    qs: {
      latlng: `${lat},${lng}`,
      key: config.google.mapsApiKey,
      language: 'en'
    }
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
