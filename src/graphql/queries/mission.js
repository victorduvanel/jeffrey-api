import { combineResolvers } from 'graphql-resolvers';
import auth                 from '../middlewares/auth';
import Mission              from '../../models/mission';
import { Unauthorized }     from '../errors';
import { registerQuery }    from '../registry';

const def = 'mission(missionId: ID!): Mission';

const mission = async (_, { missionId }, { user }) => {
  const mission = await Mission.find(missionId);

  if (!mission || user.get('id') !== mission.get('clientId')) {
    throw Unauthorized();
  }

  return mission;
};

registerQuery(def, {
  mission: combineResolvers(auth, mission)
});
