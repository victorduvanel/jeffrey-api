import chalk from 'chalk';
import knex  from '../src/services/knex';

export default () => {
  /* eslint-disable no-console */
  return knex.migrate.latest()
    .spread((batchNo, log) => {
      if (log.length === 0) {
        console.log(chalk.cyan('Already up to date'));
      } else {
        console.log(
          chalk.green(`Batch ${batchNo} run: ${log.length} migrations \n`) +
          chalk.cyan(log.join('\n'))
        );
      }
      process.exit(0);
    });
  /* eslint-enable no-console */
};
