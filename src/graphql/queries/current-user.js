import { registerQuery }    from '../registry';

const def = 'currentUser: User';
const currentUser = (_, __, { user }) => {
  if (!user) {
    return null;
  }
  return user;
};

registerQuery(def, { currentUser  });
