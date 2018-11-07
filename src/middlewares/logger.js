import morgan from 'morgan';
import config from '../config';

const format = (config.PRODUCTION ) ? 'combined' : 'dev';
const morganLogger = morgan(format);

const stackDriverIps = [
  '35.199.66.47',
  '35.198.18.224',
  '35.199.67.79',
  '104.155.77.122',
  '104.155.110.139',
  '146.148.119.250',
  '146.148.59.114',
  '23.251.144.62',
  '146.148.41.163',
  '35.186.164.184',
  '35.188.230.101',
  '35.199.27.30',
  '35.197.117.125',
  '35.203.157.42',
  '35.199.157.7',
  '35.187.242.246',
  '35.186.144.97',
  '35.198.221.49'
];

const logger = (req, res, next) => {
  if (stackDriverIps.includes(req.ip)) {
    next();
    return;
  }

  if (req.ip.indexOf('10.0.') === 0 && req.headers['user-agent'].indexOf('kube-probe/') === 0) {
    next();
  } else {
    morganLogger(req, res, next);
  }
};

export default logger;
