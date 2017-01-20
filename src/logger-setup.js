const fs = require('fs');
const path = require('path');
const winston = require('winston');

const config = require('../config/config-logger');

/**
 * @module logger
 */
module.exports = (function loggerModule() {
  // Create the log directory if it does not already exist
  // Because winston is too lazy to do it.
  const logDir = path.dirname(config.file.filename);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  winston.configure({
    transports: [
      new winston.transports.Console(config.console),
      new winston.transports.File(config.file),
    ],
    exitOnError: false,
  });

  winston.debug('Logger configured');

  return winston;
}());
