import morgan from 'morgan';
import config from '../config';

const format = (config.PRODUCTION ) ? 'combined' : 'dev';
const logger = morgan(format);

export default logger;
