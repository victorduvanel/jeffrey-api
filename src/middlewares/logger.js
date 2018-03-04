import morgan       from 'morgan';
import LeLogger     from 'le_node';
import { Writable } from 'stream';
import config       from '../config';

const format = (config.PRODUCTION ) ? 'combined' : 'dev';
const opts = {};

if (config.PRODUCTION) {
  class Bridge extends Writable {
    constructor(logger) {
      super();
      this.logger = logger;
    }

    _write(chunk, enc, next) {
      process.stdout.write(chunk, enc);
      this.logger.info(chunk.toString());
      next();
    }
  }

  const leLogger = new LeLogger({
    token: config.logentries.token
  });

  const bridge = new Bridge(leLogger);
  opts.stream = bridge;
}

const logger = morgan(format, opts);

export default logger;
