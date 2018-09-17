import { combineResolvers } from 'graphql-resolvers';
import auth                 from '../middlewares/auth';
import Mission              from '../../models/mission';
import { BadRequest }       from '../errors';
import { registerQuery }    from '../registry';

const def = 'missions(as: String!, status: String!): [Mission]';

const missions = async (_, { as, status }, { user }) => {
  const missions = await Mission
    .query((qb) => {
      switch (as) {
        case 'provider':
          qb.where({
            provider_id: user.get('id')
          });
          break;

        case 'client':
          qb.where({
            client_id: user.get('id')
          });
          break;
        default:
          throw BadRequest();
      }

      switch (status) {
        case 'ongoing':
          qb.whereNull('ended_date');
          qb.whereRaw('start_date < NOW()');
          qb.whereNot('status', 'refused');
          break;

        case 'future':
          qb.whereRaw('start_date > NOW()');
          qb.whereNot('status', 'refused');
          break;

        case 'past':
          qb.whereNotNull('ended_date');
          break;

        default:
          throw BadRequest();
      }
    })
    .fetchAll();

  return missions;
};

registerQuery(def, {
  missions: combineResolvers(auth, missions)
});
