import { combineResolvers } from 'graphql-resolvers';
import auth                 from '../middlewares/auth';
import Mission              from '../../models/mission';
import { Unauthorized }     from '../errors';
import { registerQuery }    from '../registry';

const def = 'missions: [Mission]';

const missions = async (_, __, { user }) => {
  const missions = await Mission.find(missionId);

  if (!mission || !(user.get('id') === mission.get('clientId') || user.get('id') === mission.get('providerId'))) {
    throw Unauthorized();
  }

  return mission;
};

registerQuery(def, {
  mission: combineResolvers(auth, mission)
});
