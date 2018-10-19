import { combineResolvers } from 'graphql-resolvers';
import auth                 from '../middlewares/auth';
import Mission              from '../../models/mission';
import { BadRequest }       from '../errors';
import { registerQuery }    from '../registry';

const def = 'missions(as: String!, status: String!): [Mission]';

const missions = async (_, { as, status }, { user }) => {
  const missions = await Mission
    .query((qb) => {
      qb.orderBy('start_date', 'DESC');
      qb.orderBy('created_at', 'DESC');

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
          qb.whereIn('status', ['started', 'confirmed']);
          break;

        case 'proposed':
          qb.whereIn('status', ['pending']);
          break;

        case 'future':
          qb.whereIn('status', ['accepted']);
          break;

        case 'past':
          qb.whereIn('status', ['terminated', 'aborted']);
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
