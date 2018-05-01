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
      .fetch();
  },

  graphqlDef() {
    return `
      type Review {
        id: ID!
        message: String
        rank: Int
        author: User
      }
    `;
  },

  resolver: {
    Review: {
      author: async({ id }) => {
        const review = await Review.find(id);
        if (!review) {
          return null;
        }

        await review.load(['author']);
        const author = review.related('author');
        return author.serialize();
      }
    }
  }
});

export default bookshelf.model('Review', Review);
