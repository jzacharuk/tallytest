const logger = require('winston');
const pg = require('pg');

const config = require('../config/config-database');

/**
 * @module database
 */
module.exports = (function databaseModule() {
  // Initialize the pool of connections that will be used to connect to the database.
  const pool = new pg.Pool(config.connection);

  pool.on('error', (err, client) => {
    // FIXME: Handle error.
    logger.error('THERE WAS A POOL ERROR!', err, client);
    // if a client is idle in the pool
    // and receives an error - for example when your PostgreSQL server restarts
    // the pool will catch the error & let you handle it here
  });

  /**
   * Parse the rows retrieved from the database.
   */
  function parseRows(rows, type, callback) {
    // If everything worked then callback the results.
    if (type === 'Single') {
      if (rows.length === 0) {
        return callback(null, null);
      }

      if (rows.length === 1) {
        const row = rows[0];

        if (row === undefined) {
          return callback(null, null);
        }
        const single = row[Object.keys(row)[0]];

        return callback(null, single);
      }

      return callback(`Incorrect number of records found: ${rows}`);
    }

    if (type === 'All') {
      return callback(null, rows);
    }

    return callback('Unknown type for runQuery', type);
  }

  /**
   * Run a query against the database.
   */
  function runQuery(query, params, type, callback) {
    logger.debug('database.runQuery()');

    // Acquire a client from the pool.
    pool.connect((poolErr, client, poolDone) => {
      // If we could not acquire a client then callback an error.
      if (poolErr) {
        return callback(poolErr);
      }

      // Run the query against the client.
      client.query(query, params, (queryErr, queryResult) => {
        // Release the client back to the pool
        poolDone();

        // If we could not run the query then callback an error.
        if (queryErr) {
          return callback(queryErr);
        }

        const rows = queryResult.rows;

        parseRows(rows, type, callback);
        return undefined;
      });
      return undefined;
    });
  }

  return {
    parseRows,
    runQuery,
  };
}());
