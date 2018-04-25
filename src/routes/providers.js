import oauth2     from '../middlewares/oauth2';

const ONBOARDING_STEPS = [
  'provider-profile',
  'personal-details',
  'phone-number',
  'business',
  'bank-details',
  'identity-document',
  'tos'
];

export const post = [
  oauth2,

  async (req, res) => {
    const { user } = req;

    const onboardingProgress = await user.onboardingProgress();
    const onboarindgCompleted = !!ONBOARDING_STEPS.find(step => onboardingProgress.includes(step));

    if (onboarindgCompleted) {
      await user.syncStripeAccount();
      user.set('isProvider', true);
      user.set('isAvailable', true);
      await user.save();

      res.send({ success: true });
      return;
    }

    res.send({ success: false });
  }
];
