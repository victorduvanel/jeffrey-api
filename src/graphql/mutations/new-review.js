import { combineResolvers } from 'graphql-resolvers';
import auth                 from '../middlewares/auth';
import { registerMutation } from '../registry';
import { GraphQLError }     from 'graphql';
import Mission              from '../../models/mission';
import Review               from '../../models/review';

const def = 'newReview(rank: String!, message: String!, missionId: ID!): Boolean';

const newReview = async (_, { rank, message, missionId }, { user }) => {
  const mission = await Mission.find(missionId);

  if (!mission) {
    throw new GraphQLError('Mission not found');
  }

  try {
    Review.create({
      rank,
      message,
      authorId: user.get('id'),
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
