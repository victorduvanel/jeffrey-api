import { combineResolvers } from 'graphql-resolvers';
import auth                 from '../middlewares/auth';
import { registerQuery }    from '../registry';

const def = 'paymentMethods: Business';
const businessDetails = async (_, __, { user }) => {
  const business = await user.getBusiness();
  const isOwnerPersonalAddress = await business.postalAddressIsOwnerPersonalAddress();

  return {
    id: business.id,
    name: business.get('name'),
    taxId: business.get('taxId'),
    type: business.get('type'),
    isOwnerPersonalAddress
  };
};

registerQuery(def, {
  businessDetails: combineResolvers(auth, businessDetails)
});
