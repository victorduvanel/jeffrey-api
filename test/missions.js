import 'babel-polyfill';
import uuid            from 'uuid';
import assert          from 'assert';
import User            from '../src/models/user';
import ServiceCategory from '../src/models/service-category';
import Mission, {
  PENDING,
  CANCELED,
  ACCEPTED,
  REFUSED,
  STARTED,
  ABORTED,
  CONFIRMED,
  TERMINATED
} from '../src/models/mission';

// const should = chai.should();

describe('Mission', () => {
  let serviceCategory;
  let someoneElse;
  let providerA;
  let clientA;
  let mission;

  before(async () => {
    serviceCategory = await ServiceCategory.create({
      id: uuid.v4(),
      parentId: null,
      slug: 'test-service-category',
      ordinalPosition: 0
    });

    someoneElse = await User.create({
      firstName: 'someoneElse'
    });

    providerA = await User.create({
      firstName: 'providerA'
    });

    clientA = await User.create({
      firstName: 'clientA'
    });

    mission = await Mission.create({
      startDate: new Date(),
      price: 1000,
      currency: 'EUR',
      provider: providerA,
      client: clientA,
      serviceCategory
    });
  });

  after(async () => {
    await mission.destroy();
    await serviceCategory.destroy();
    await someoneElse.destroy();
    await providerA.destroy();
    await clientA.destroy();
  });

  beforeEach(async () => {
    mission.set('status', PENDING);
    return mission.save();
  });


  it('should not be possible for a third person to update the mission’s status', async () => {
    assert(mission.get('status') === PENDING);

    assert.rejects(
      mission.setStatus(ACCEPTED, someoneElse),
      {
        name: 'GraphQLError',
        message: 'Authentication required'
      }
    );
  });

  it('provider can cancel a mission', async () => {
    await mission.setStatus(CANCELED, providerA);
  });

  it('canceled mission cannot be accepted', async () => {
    await mission.setStatus(CANCELED, providerA);

    assert.rejects(
      mission.setStatus(ACCEPTED, clientA),
      {
        name: 'GraphQLError',
        message: 'Invalid new status'
      }
    );
  });

  it('refused mission cannot be started', async () => {
    await mission.setStatus(REFUSED, clientA);

    assert.rejects(
      mission.setStatus(STARTED, providerA),
      {
        name: 'GraphQLError',
        message: 'Invalid new status'
      }
    );
  });

  it('aborted mission cannot be terminated', async () => {
    await mission.setStatus(ACCEPTED, clientA);
    await mission.setStatus(STARTED, providerA);
    await mission.setStatus(ABORTED, clientA);

    assert.rejects(
      mission.setStatus(TERMINATED, providerA),
      {
        name: 'GraphQLError',
        message: 'Invalid new status'
      }
    );
  });

  it('mission can be terminated by a provider', async () => {
    await mission.setStatus(ACCEPTED, clientA);
    await mission.setStatus(STARTED, providerA);
    await mission.setStatus(CONFIRMED, clientA);
    await mission.setStatus(TERMINATED, providerA);
  });

  it('mission can be terminated by a client', async () => {
    await mission.setStatus(ACCEPTED, clientA);
    await mission.setStatus(STARTED, providerA);
    await mission.setStatus(CONFIRMED, clientA);
    await mission.setStatus(TERMINATED, clientA);
  });

  it('mission cost', async () => {
    const startDate = new Date(0);
    const endDate = new Date(1800 * 1000); // 30 min

    assert(Mission.computeMissionTotalCost(startDate, endDate, 313) === 157);
  });

  it('mission cost service fees', async () => {
    const startDate = new Date(0);
    const endDate = new Date(1800 * 1000); // 30 min

    assert(Mission.computeProviderGain(startDate, endDate, 313) === 141);
  });
});
