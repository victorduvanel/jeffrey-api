import yaml from 'js-yaml';
import fs   from 'fs';

const configFile = process.env.CONFIG || 'config.yml';
const config = yaml.safeLoad(fs.readFileSync(configFile));
const version = fs.readFileSync('VERSION', { encoding: 'utf8' });

config.version = version.split('\n')[0];

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
