import { GraphQLError } from 'graphql';
import { Unauthorized } from '../../graphql/errors';

const InvalidNewStatus = () => new GraphQLError('Invalid new status');

export const provider = 'provider';
export const client = 'client';

const states = {};

class Status {
  constructor({ mustBe, triggeredBy } = {}) {
    this.mustBe = mustBe || [];
    this.triggeredBy = triggeredBy || [];
  }

  trigger(currentStatusName, whom) {
    const currentStatus = states[currentStatusName];

    if (!this.triggeredBy.includes(whom)) {
      throw Unauthorized();
    }

    if (this.mustBe !== currentStatus) {
      throw InvalidNewStatus();
    }
  }
}

const pending = new Status();

const canceled = new Status({
  mustBe: pending,
  triggeredBy: [ provider ]
});

const accepted = new Status({
  mustBe: pending,
  triggeredBy: [ client ]
});

const refused = new Status({
  mustBe: pending,
  triggeredBy: [ client ]
});

const started = new Status({
  mustBe: accepted,
  triggeredBy: [ provider ]
});

const aborted = new Status({
  mustBe: started,
  triggeredBy: [ client ]
});

const confirmed = new Status({
  mustBe: started,
  triggeredBy: [ client ]
});

const terminated = new Status({
  mustBe: confirmed,
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
