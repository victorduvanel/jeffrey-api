import uuid      from 'uuid';
import bookshelf from '../services/bookshelf';
import Base      from './base';

const Review = Base.extend({
  tableName: 'reviews',

  provider() {
    return this.belongsTo('User');
  },

  author() {
    return this.belongsTo('User', 'author_id');
  }
}, {
  create: async function({ rank, message, missionId, authorId }) {
    const id = uuid.v4();

    return this.forge({
      id,
      rank,
      message,
      missionId,
      authorId
    }).save(null, { method: 'insert' });
  },

  find: function(id) {
    return this.forge({ id })
      .fetch();
  }
});

export default bookshelf.model('Review', Review);
