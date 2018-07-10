import uuid      from 'uuid';
import bookshelf from '../services/bookshelf';
import Base      from './base';

const Review = Base.extend({
  tableName: 'reviews',

  mission() {
    return this.belongsTo('Mission');
  },

  author() {
    return this.belongsTo('User', 'author_id');
  },

  /* GRAPHQL PROPS */
  message() {
    return this.get('message');
  },

  rank() {
    return this.get('rank');
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
