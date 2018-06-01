import Knex   from 'knex';
import chalk  from 'chalk';
import config from '../src/config';

export default ({ dev }) => {
  if (dev) {
    config.db.seeds = {
      directory: './seeds/dev'
    };
  }

  const knex = Knex(config.db);

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
