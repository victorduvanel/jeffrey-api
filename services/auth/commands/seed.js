import chalk from 'chalk';
import knex  from '../src/services/knex';

export default () => {
  /* eslint-disable no-console */
  return knex.seed.run()
    .spread((log) => {
      if (log.length === 0) {
        console.log(chalk.cyan('No seed files exist'));
      } else {
        console.log(chalk.green(`Ran ${log.length} seed files \n${chalk.cyan(log.join('\n'))}`));
      }
      process.exit(0);
    });
  /* eslint-enable no-console */
};
