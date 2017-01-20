const fs = require('fs');
const path = require('path');
const winston = require('winston');

/**
 * @module logger
 */
module.exports = function loggerModule(loggerCfg) {
  const LOG_DIR = 'logs';

  // Create the log directory if it does not already exist
  // Because winston is too lazy to do it.
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR);
  }

  const logger = new winston.Logger({
    transports: [
      new winston.transports.Console({
        level: loggerCfg.consoleLevel,
        prettyPrint: true,
        json: false,
        colorize: true,
        timestamp: true,
        humanReadableUnhandledException: true,
      }),
      new winston.transports.File({
        level: 'debug',
        colorize: 'true',
        timestamp: 'true',
        filename: path.join(LOG_DIR, 'logfile.log'),
        maxsize: 5 * 1024 * 1024, // 5MB
        maxFiles: 20, // So 5MB x 20 files = 100MB of logs total (except they get zipped)
        json: false,
        prettyPrint: true,
        tailable: true,
        zippedArchive: true,
      }),
    ],
    exitOnError: false,
  });

  return logger;
};
