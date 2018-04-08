import apn    from 'apn';
import config from '../config';

const provider = new apn.Provider(config.apn);

export default provider;
