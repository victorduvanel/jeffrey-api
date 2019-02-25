import { combineResolvers } from 'graphql-resolvers';
import request              from 'request-promise';
import auth                 from '../middlewares/auth';
import { registerMutation } from '../registry';
import User                 from '../../models/user';
import ServiceCategory      from '../../models/service-category';
import Mission              from '../../models/mission';
import config               from '../../config';

const createMissionMessage = async (mission, provider, client) => {
  await mission.load(['serviceCategory']);
  const serviceCategory = mission.related('serviceCategory');
  const serviceCategoryAttributes = await serviceCategory.attrs();

  await request({
    uri: `${config.chat.host}/messages`,
    method: 'POST',
    json: true,
    body: {
      from: provider.get('id'),
      to: client.get('id'),
      message: {
        mission: {
          id: mission.get('id'),
          status: mission.status(),
          startDate: mission.startDate(),
          price: {
            amount: mission.price(),
            currency: mission.currency()
          }
        },
        serviceCategory: {
          id: serviceCategory.get('id'),
          color: serviceCategory.get('color'),
          icon: serviceCategoryAttributes.symbol
        }
      }
    }
  });
};

const def = `
  newMission(
    startDate: String!,
    price: Int!,
    clientId: ID!,
    serviceCategoryId: ID!
  ): String`;

const newMission = async (_, { startDate, clientId, price, serviceCategoryId }, { user }) => {
  const client = await User.find(clientId);
  if (!client) {
    throw new Error('Client unknown');
  }

  const serviceCategory = await ServiceCategory.find(serviceCategoryId);
  if (!ServiceCategory) {
    throw new Error('Service not supported');
  }

  const country = await user.country();
  if (!country) {
    throw new Error('Country not supported');
  }

  const mission = await Mission.create({
    startDate: new Date(startDate),
    price,
    currency: country.currency(),
    provider: user,
    client,
    serviceCategory
  });

  try {
    await createMissionMessage(mission, user, client);
  } catch (err) {
    console.error(err);
  }

  return mission.get('id');
};

registerMutation(def, {
  newMission: combineResolvers(auth, newMission)
});
