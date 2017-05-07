/* eslint-disable no-console */

import chalk from 'chalk';
import knex  from '../src/services/knex';

import Subscription from '../src/models/subscription';

export default async () => {
  // const today = 'current_date';
  const date = '2017-03-23';

  const result = await knex.raw(
    `select id from subscriptions where next_renewal = '${date}'`
  );

  const ids = result.rows.map((row) => row.id);
  const length = ids.length;

  if (!length) {
    console.log(chalk.blue('Nothing to do'));
  } else {
    console.log(chalk.yellow(`${length} subscription(s) to renew`));
  }

  for (let id of ids) {
    const res = await Subscription.renew(id, date);

    console.log(res);
  }

  await knex.destroy();
};
