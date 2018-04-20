import uuid      from 'uuid';
import bookshelf from '../services/bookshelf';
import Base      from './base';
import User      from './user';

const Provider = Base.extend({
  tableName: 'providers',

  user() {
    return this.belongsTo('User');
  }
}, {
  create: async function(user) {
    const id = uuid.v4();

    return this.forge({ id, userId: user.get('id') })
      .save(null, { method: 'insert' });
  },

  graphqlDef: function() {
    return '';
  },

  resolver: {
    Query: {
      providers: async (_, __, { user }, { variableValues: { limit, offset } }) => {
        const users = await User.query({ limit, offset }).fetchAll();

        return users.map(user => ({
          id: user.id,
          firstName: user.get('firstName'),
          lastName: user.get('lastName'),
          email: user.get('email'),
          profilePicture: user.get('profilePicture')
        }));
      }
    }
  }
});

export default bookshelf.model('Provider', Provider);
