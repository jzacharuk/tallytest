// Import remote modules
const async = require('async');

// Import local modules, passing in logger and configuration as needed.
const config = require('./config');
const logger = require('./logger')(config.loggerOptions);
const database = require('./database')(config.databaseOptions, logger);
const vault = require('./vault')(database, logger);
const central = require('./central')(config.centralOptions, logger);

/**
 * This module is the backbone of the application. It contains the the majority of the business
 * logic and dictates the flow of the application.
 *
 * @module app
 */
module.exports = function app() {
  /**
   * The number of queries to run against the Universal Schema in parallel.
   */
  const NUM_PARALLEL_QUERIES = 5;

  /**
   * This function will perform the specified updates against the Universal Schema.
   * <br/><br/>
   * The updates will be applied one at a time in the order they are specified. If any
   * of the updates fail, the previous updates that succeeded will still persist, but
   * an error will be returned in the callback and further updates will not be attempted.
   *
   * @param {array} updates - An array of updates to perform.
   * @param {Function} callback - A callback to run on completion of the updates.
   * @param {Object} callback.error - If an error occured this will include details on the error.
   * @returns {void}
   */
  function updatePeform(updates, callback) {
    logger.debug('updatePeform()', updates);

    async.series(updates, vault.performUpdate, (err) => {
      callback(err);
    });
  }

  /**
   * This function will perform a single batch of updates. A batch includes the following steps:
   * <ol>
   * <li>Retrieve the current version from the Universal Schema.</li>
   * <li>Request a list of updates from the Central Server based on the current version.</li>
   * <li>Perform the updates against the Universal Schema.</li>
   * </ol>
   * Note that the Central Server dictates how many updates will be sent in a single batch.
   *
   * @param {Function} callback - A callback to run on completion of the batch of updates.
   * @param {Object} callback.error - If an error occured this will include details on the error.
   * @returns {void}
   */
  function updateBatch(callback) {
    logger.debug('updateBatch()');

    async.waterfall([
      vault.retrieveVersion,
      // The below command will callback a specific error if there are no updates which will
      // cause this function to instantly callback without trying to perform updates.
      central.requestUpdates,
      updatePeform,
    ], callback);
  }

  /**
   * This function will continually perform batches of updates until the Universal Schema is
   * completely updated.
   *
   * @param {Function} callback - A callback to run on completion of all updates.
   * @param {Object} callback.error - If an error occured this will include details on the error.
   * @returns {void}
   */
  function updateAll(callback) {
    logger.debug('updateAll()');

    async.forever(updateBatch, (err) => {
      // Hide the 'fake' update complete error.
      if (err === central.UPDATE_COMPLETE) {
        return callback(null);
      }

      return callback(err);
    });
  }

  /**
   * This function will perform the specified queries against the Universal Schema. The queries
   * will be run in parallel (up to 5 at once).
   *
   * Note that if any of the queries fail to run, then an error will be returned in the callback.
   *
   * @param {array} queryList - An array of queries to perform.
   * @param {Function} callback - A callback to run on completion of the queries.
   * @param {Object} callback.error - If an error occured this will include details on the error.
   * @param {int} callback.results - An array containing the results of the query.
   * @returns {void}
   */
  function queryPerform(queryList, callback) {
    logger.debug('queryPerform()', queryList);

    async.mapLimit(queryList, NUM_PARALLEL_QUERIES, vault.performAggregateQuery, (err, results) => {
      callback(err, results);
    });
  }

  /**
   * This function will handle a single batch of queries. A batch includes the following steps:
   * <ol>
   * <li>Request the queries from the Central Server.</li>
   * <li>Perform those queries against the Universal Schema.</li>
   * <li>Send the results back to the Central Server.</li>
   * </ol>
   * Note that the Central Server dictates how many queries will be sent in a single batch.
   *
   * @param {Function} callback - A callback to run on completion of the batch of queries.
   * @param {Object} callback.error - If an error occured this will include details on the error.
   * @returns {void}
   */
  function queryBatch(callback) {
    logger.debug('queryBatch()');

    async.waterfall([
      central.requestQueries,
      queryPerform,
      central.sendResults,
    ], callback);
  }

  /**
   * This function will continually perform batches of queries until the Central Server has no
   * queries left to run.
   *
   * @param {Function} callback - A callback to run on completion of all queries.
   * @param {Object} callback.error - If an error occured this will include details on the error.
   * @returns {void}
   */
  function queryAll(callback) {
    logger.debug('queryAll()');

    async.forever(queryBatch, (err) => {
      // Hide the 'fake' queries complete error.
      if (err === central.NO_QUERIES_FOUND) {
        return callback(null);
      }

      return callback(err);
    });
  }

  function run() {
    logger.debug('run()');

    async.series([
      updateAll,
      queryAll,
    ], (err) => {
      if (err) {
        logger.error('ERROR', err);
        process.exit(1);
      }

      process.exit(0);
    });
  }

  return {
    run,
  };
};
