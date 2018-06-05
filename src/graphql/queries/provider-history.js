import Promise              from 'bluebird';
import Mission              from '../../models/mission';
import { registerQuery }    from '../registry';

const def = 'providerHistory: [User]';

const providerHistory = async (_, __, { user }) => {
  if (!user) {
    return [];
  }

  const clients = await Mission.providerHistory(user);
  return Promise.all(clients.toArray().map(user => user.serialize()));
};

registerQuery(def, { providerHistory });
