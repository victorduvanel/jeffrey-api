import Raven  from 'raven';
import config from '../config';

Raven.config(config.raven.dsn).install();

export default Raven;
