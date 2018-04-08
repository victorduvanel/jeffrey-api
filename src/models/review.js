import Promise   from 'bluebird';
import uuid      from 'uuid';
import bookshelf from '../services/bookshelf';
import Base      from './base';

const Review = Base.extend({
  tableName: 'reviews',

  provider() {
    return this.belongsTo('User');
  },

  author() {
    return this.belongsTo('User');
  }
}, {
  create: async function({ provider, author }) {
    const id = uuid.v4();

    return this.forge({
      id,
      providerId: provider.get('id'),
      authorId: author.get('id'),
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

export default bookshelf.model('Review', Review);
