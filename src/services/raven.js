import Raven  from 'raven';
import config from '../config';

if (config.PRODUCTION) {
  Raven.config(
    config.raven.dsn,
    {
      environment: config.env
    }
  ).install();
}

export default Raven;
