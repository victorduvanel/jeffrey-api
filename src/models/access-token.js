import Promise   from 'bluebird';
import crypto    from 'crypto';
import uuid      from 'uuid';
import bookshelf from '../services/bookshelf';
import Base      from './base';

const randomBytes = Promise.promisify(crypto.randomBytes);

const AccessToken = Base.extend({
  tableName: 'access_tokens',

  user() {
    return this.belongsTo('User');
  }
}, {
  create: async function({ user, singleUse }) {
    const id = uuid.v4();
    const token = (await randomBytes(127)).toString('hex');

    return this.forge({
      id, token, userId: user.get('id'), singleUse
    })
      .save(null, { method: 'insert' });
  },

  find: function(token) {
    return this.forge({ token })
      .fetch({
        withRelated: ['user']
      });
  }
});

export default bookshelf.model('AccessToken', AccessToken);
