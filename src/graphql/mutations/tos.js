import { combineResolvers } from 'graphql-resolvers';
import auth                 from '../middlewares/auth';
import { registerMutation } from '../registry';
import TOSAcceptance        from '../../models/tos-acceptance';

const def = 'tos: [String]';

const tos = async (_, __, { user, req }) => {
  await TOSAcceptance.create({
    user,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  return user.onboardingProgress();
};

registerMutation(def, { tos: combineResolvers(auth, tos) });
