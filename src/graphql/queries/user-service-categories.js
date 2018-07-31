import { combineResolvers } from 'graphql-resolvers';
import auth                 from '../middlewares/auth';
import { registerQuery }    from '../registry';

const def = 'userServiceCategories(parentId: String): [ServiceCategory]';

const userServiceCategories = async (_, { parentId }, { user }) => {
  const categories = await user.serviceCategories({ childrenOf: parentId });
  return categories;
};

registerQuery(def, {
  userServiceCategories: combineResolvers(auth, userServiceCategories)
});