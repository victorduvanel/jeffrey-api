import { combineResolvers } from 'graphql-resolvers';
import { GraphQLError }     from 'graphql';
import knex                 from '../../services/knex';
import Mission              from '../../models/mission';
import auth                 from '../middlewares/auth';
import { registerMutation } from '../registry';
import { Unauthorized }     from '../errors';

const def = 'missionPaid(id: ID!): Boolean';

export const missionPaid = async (_, { id }, { user }) => {
  const mission = await Mission.find(id);

  if (!mission) {
    throw new GraphQLError('Mission not found');
  }

  if (!mission || user.get('id') !== mission.get('providerId')) {
    throw Unauthorized();
  }

  const paymentMethod = mission.get('paymentMethod');
  if (!(['cash-at-delivery', 'credit-card-at-delivery'].includes(paymentMethod))) {
    throw Unauthorized();
  }

  mission.set('paidAt', knex.raw('NOW()'));
  await mission.save();

  return true;
};

registerMutation(def, {
  missionPaid: combineResolvers(auth, missionPaid)
});
