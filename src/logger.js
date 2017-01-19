const winston = require('winston');

/**
 * @module logger
 */
module.exports = function loggerModule(loggerCfg) {
  const logger = new winston.Logger({
    transports: [
      new winston.transports.Console({
        level: loggerCfg.consoleLevel,
        prettyPrint: true,
        json: false,
        colorize: true,
      }),
    ],
    exitOnError: false,
  });

  return logger;
};
