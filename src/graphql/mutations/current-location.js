import { combineResolvers } from 'graphql-resolvers';
import knex                 from '../../services/knex';
import auth                 from '../middlewares/auth';
import { registerMutation } from '../registry';

const def = 'currentLocation(lat: Float!, lng: Float!, timestamp: String!, description: String, descriptionLocale: String): Boolean';

const currentLocation = async (_, { lat, lng, timestamp, description, descriptionLocale }, { user }) => {
  const parsedTimestamp = parseFloat(timestamp);

  if (Number.isNaN(parsedTimestamp)) {
    throw new Error('invalid timestamp');
  }

  await knex
    .insert({
      user_id: user.get('id'),
      lat,
      lng,
      timestamp: new Date(parsedTimestamp),
      description,
      description_locale: descriptionLocale,
      created_at: knex.raw('NOW()')
    })
    .into('user_locations');

  return true;
};

registerMutation(def, {
  currentLocation: combineResolvers(auth, currentLocation)
});
