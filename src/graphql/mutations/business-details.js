import { combineResolvers } from 'graphql-resolvers';
import auth                 from '../middlewares/auth';
import { registerMutation } from '../registry';
import PostalAddress        from '../../models/postal-address';

const def = 'businessDetails(details: BusinessDetails): Boolean';

const businessDetails = async (_, { details }, { user }) => {
  const business = await user.getBusiness();
  const isOwnerPersonalAddress = await business.postalAddressIsOwnerPersonalAddress();

  const {
    name,
    type,
    taxId,

    city,
    country,
    line1,
    line2,
    postalCode,
    state
  } = details;

  business.set('name', name);
  business.set('type', type);
  business.set('taxId', taxId);

  if (details.isOwnerPersonalAddress) {
    business.set('postalAddressId', user.get('postalAddressId'));
  } else {
    // We do not allow update of the postal address id the address is the
    // business owner's personal address.
    // Instead we create a new postal address for the business.
    if (isOwnerPersonalAddress) {
      const newPostallAddress = await PostalAddress.create({
        city,
        country,
        line1,
        line2,
        postalCode,
        state
      });

      business.set('postalAddressId', newPostallAddress.id);
    } else {
      const postalAddress = await business.getPostalAddress();
      await postalAddress.update({
        city,
        country,
        line1,
        line2,
        postalCode,
        state
      });
    }
  }

  if (business.hasChanged()) {
    await business.save();
  }

  return true;
};

registerMutation(def, {
  businessDetails: combineResolvers(
    auth,
    businessDetails
  )
});
