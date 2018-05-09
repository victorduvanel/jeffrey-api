import uuid      from 'uuid';
import bookshelf from '../services/bookshelf';
import Base      from './base';

const LoginToken = Base.extend({
  tableName: 'login_tokens',

  user() {
    return this.belongsTo('User');
  }
}, {
  create: async function({ user }) {
    const id = uuid.v4();

    return this.forge({
      id, userId: user.get('id')
    })
      .save(null, { method: 'insert' });
  },

  find: function(id) {
    return this.forge({ id })
      .fetch({
        withRelated: ['user']
      });
  }
});

export default bookshelf.model('LoginToken', LoginToken);
