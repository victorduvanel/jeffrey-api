import { registerType } from '../registry';
import Review           from '../../models/review';

const def = `
type Review {
  id: ID!
  message: String
  rank: Int
  author: User
}
`;

const resolver = {
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
};

registerType(def, resolver);
