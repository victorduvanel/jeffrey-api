import morgan from 'morgan';
import config from '../config';

export default morgan((config.PRODUCTION ) ? 'combined' : 'dev');
