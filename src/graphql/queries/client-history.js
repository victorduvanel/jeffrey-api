import Mission              from '../../models/mission';
import { registerQuery }    from '../registry';

const def = `
clientHistory(
  providerId: ID!
): [Mission]
`;

const clientHistory = async (_, { providerId }, { user }) => {
  if (!user)
    return [];

  const missions = await Mission.clientHistory({user, providerId });
  return missions.toArray().map(mission => mission.serialize());
};

registerQuery(def, {
  clientHistory
});
