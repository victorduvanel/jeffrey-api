import winston            from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';

const Logger = winston.Logger;
const Console = winston.transports.Console;

const loggingWinston = new LoggingWinston();

const logger = new Logger({
  level: 'info', // log at 'info' and above
  transports: [
    // Log to the console
    new Console(),
    // And log to Stackdriver Logging
    loggingWinston
  ],
});

export default logger;
