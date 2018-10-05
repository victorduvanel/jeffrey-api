import { GraphQLError } from 'graphql';
import { Unauthorized } from '../../graphql/errors';

const InvalidNewStatus = () => new GraphQLError('Invalid new status');

export const provider = 'provider';
export const client = 'client';

const states = {};

class Status {
  constructor({ mustBe, triggeredBy, name } = {}) {
    this.name = name;
    this.mustBe = !mustBe || Array.isArray(mustBe) ? mustBe : [mustBe];
    this.triggeredBy = triggeredBy || [];
  }

  trigger(currentStatusName, whom) {
    const currentStatus = states[currentStatusName];

    if (!this.triggeredBy.includes(whom)) {
      throw Unauthorized();
    }

    if (this.mustBe && !this.mustBe.includes(currentStatus)) {
      throw InvalidNewStatus();
    }
  }
}

const pending = new Status();

const accepted = new Status({
  name: 'accepted',
  mustBe: pending,
  triggeredBy: [ client ]
});

const canceled = new Status({
  name: 'canceled',
  mustBe: [pending, accepted],
  triggeredBy: [ provider, client ]
});

const refused = new Status({
  name: 'refused',
  mustBe: pending,
  triggeredBy: [ client ]
});

const started = new Status({
  name: 'started',
  mustBe: accepted,
  triggeredBy: [ provider ]
});

const aborted = new Status({
  name: 'aborted',
  mustBe: started,
  triggeredBy: [ client ]
});

const confirmed = new Status({
  name: 'confirmed',
  mustBe: started,
  triggeredBy: [ client ]
});

const terminated = new Status({
  name: 'terminated',
  mustBe: [started, confirmed],
  triggeredBy: [ client, provider ]
});

Object.assign(states, {
  pending,
  canceled,
  accepted,
  refused,
  started,
  aborted,
  confirmed,
  terminated
});

export default states;
