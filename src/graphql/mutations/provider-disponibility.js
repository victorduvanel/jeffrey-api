import { combineResolvers } from 'graphql-resolvers';
import { registerMutation } from '../registry';
import auth                 from '../middlewares/auth';

const def = 'providerDisponibility(disponibility: Boolean!): Boolean';

const providerDisponibility = async (_, { disponibility }, { user }) => {
  user.set('isAvailable', disponibility);
  await user.save();
  return user.get('isAvailable');
};

registerMutation(def, {
  providerDisponibility: combineResolvers(auth, providerDisponibility)
});
