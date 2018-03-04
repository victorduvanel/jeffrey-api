import uuid      from 'uuid';
import bookshelf from '../services/bookshelf';
import Base      from './base';

const Credit = Base.extend({
  tableName: 'credits',

  user() {
    return this.belongsTo('User');
  }
}, {
  create: async function({
    user,
    amount
  }) {
    const id = uuid.v4();

    return await this.forge({
      id,
      userId: user.get('id'),
      amount
    })
      .save(null, { method: 'insert' });
  }
});

export default bookshelf.model('Credit', Credit);
