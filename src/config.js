import yaml from 'js-yaml';
import fs   from 'fs';

const configFile = process.env.CONFIG || 'config.yml';
const config = yaml.safeLoad(fs.readFileSync(configFile));

switch (process.env.NODE_ENV) {
  case 'production':
    config.env = 'production';
    config.PRODUCTION = true;
    break;

  case 'test':
    config.env = 'test';
    config.TEST = true;
    break;

  default:
    config.env = 'development';
    config.DEVELOPMENT = true;
}

export default config;
