import Knex   from 'knex';
import config from '../config';

export default Knex(config.db);
