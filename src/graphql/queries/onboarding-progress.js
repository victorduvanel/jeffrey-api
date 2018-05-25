import { combineResolvers } from 'graphql-resolvers';
import auth                 from '../middlewares/auth';
import { registerQuery }    from '../registry';

const def = 'onboardingProgress: [String]';
const onboardingProgress = (_, __, { user }) => {
  return user.onboardingProgress();
};

registerQuery(def, { onboardingProgress: combineResolvers(auth, onboardingProgress) });
