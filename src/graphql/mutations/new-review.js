import { combineResolvers } from 'graphql-resolvers';
import auth                 from '../middlewares/auth';
import { registerMutation } from '../registry';
import { GraphQLError }     from 'graphql';
import Mission              from '../../models/mission';
import Review               from '../../models/review';

const def = 'newReview(rank: String!, message: String!, authorId: ID!, missionId: ID!): Boolean';

const newReview = async (_, { rank, message, authorId, missionId }, { user }) => {
  const mission = await Mission.find(missionId);

  if (user.get('id') !== authorId) {
    throw new GraphQLError('The connected user must be the author of the comment');
  }

  if (!mission) {
    throw new GraphQLError('Mission not found');
  }

  try {
    Review.create({
      rank,
      message,
      authorId,
      missionId
    });
    return true;
  }
  catch(err) {
    return false;
  }
};

registerMutation(def, {
  newReview: combineResolvers(auth, newReview)
});
