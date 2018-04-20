import uuid          from 'uuid';
import bookshelf     from '../services/bookshelf';
import Base          from './base';

const TOSAcceptance = Base.extend({
  tableName: 'tos_acceptances',

  user() {
    return this.belongsTo('User');
  }
}, {
  create: async function({ user, userAgent, ip }) {
    const id = uuid.v4();

    return this.forge({
      id,
      userId: user.get('id'),
      userAgent,
      ip
    })
      .save(null, { method: 'insert' });
  }
});

export default bookshelf.model('TOSAcceptance', TOSAcceptance);
