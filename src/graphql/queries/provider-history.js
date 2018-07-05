import Mission              from '../../models/mission';
import { registerQuery }    from '../registry';

const def = 'providerHistory: [User]';

const providerHistory = async (_, __, { user }) => {
  if (!user) {
    return [];
  }

  const clients = await Mission.providerHistory(user);
  return clients.toArray();
};

registerQuery(def, { providerHistory });
