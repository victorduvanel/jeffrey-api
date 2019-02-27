import { combineResolvers } from 'graphql-resolvers';
import auth                 from '../middlewares/auth';
import { registerMutation } from '../registry';

const def = 'createProvider: Boolean';

const ONBOARDING_STEPS = [
  'provider-profile',
  'personal-details',
  'phone-number',
  'business',
  'bank-details',
  'identity-document',
  'tos'
];

const createProvider = async (_, __, { user }) => {
  if (!user) {
    return false;
  }

  const onboardingProgress = await user.onboardingProgress();
  const onboarindgCompleted = !!ONBOARDING_STEPS.find(step => onboardingProgress.includes(step));

  if (onboarindgCompleted) {
    // await user.syncStripeAccount();
    user.set('isProvider', true);
    user.set('isAvailable', true);
    await user.save();

    return true;
  }
  return false;
};

registerMutation(def, {
  createProvider: combineResolvers(auth, createProvider)
});
