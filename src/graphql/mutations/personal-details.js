import { combineResolvers } from 'graphql-resolvers';
import { registerMutation } from '../registry';
import auth                 from '../middlewares/auth';

const def = 'personalDetails(details: PersonalDetails): [String]';

const personalDetails = async (_, { details }, { user }) => {
  let {
    firstName,
    lastName,
    dateOfBirth,
    gender,
    city,
    country,
    line1,
    line2,
    postalCode,
    state
  } = details;

  await user.setDetails({
    firstName,
    lastName,
    dateOfBirth,
    gender,
  });

  const postalAddress = await user.getPostalAddress();

  await postalAddress.update({
    city,
    country,
    line1,
    line2,
    postalCode,
    state
  });

  return user.onboardingProgress();
};

registerMutation(def, {
  personalDetails: combineResolvers(auth, personalDetails)
});
