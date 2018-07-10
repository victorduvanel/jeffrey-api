import { registerType } from '../registry';

const def = `
type Review {
  id: ID!
  message: String
  rank: Int
  author: User
  mission: Mission
}
`;

const resolver = {
  Review: {
    author: async(review) => {
      await review.load(['author']);
      return review.related('author');
    },

    mission: async(review) => {
      await review.load(['mission']);
      return review.related('mission');
    }
  }
};

registerType(def, resolver);
