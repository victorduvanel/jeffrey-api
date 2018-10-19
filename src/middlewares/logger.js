import morgan from 'morgan';
import config from '../config';

const format = (config.PRODUCTION ) ? 'combined' : 'dev';
const morganLogger = morgan(format);

const logger = (req, res, next) => {
  if (req.ip.indexOf('10.0.') === 0 && req.headers['user-agent'].indexOf('kube-probe/') === 0) {
    next();
  } else {
    morganLogger(req, res, next);
  }
};

export default logger;
