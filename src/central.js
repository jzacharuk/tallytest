const logger = require('winston');

/**
 * This module will provide the interface with the Central Server.
 *
 * @param {Object} db - An instance of a database connection.
 * @param {Object} logger - An instance of a logger.
 * @module central
 */
module.exports = (function central(cfg) {
  const myUpdates = [
      { version: 1, statement: 'INSERT INTO indicator.concept (name) VALUES (\'diabetes\');' },
      { version: 2, statement: 'INSERT INTO indicator.concept (name) VALUES (\'chronic kidney\');' },
      { version: 3, statement: 'INSERT INTO indicator.concept (name) VALUES (\'copd\');' },
      { version: 4, statement: 'INSERT INTO indicator.concept (name) VALUES (\'pain\');' },
      { version: 5, statement: 'INSERT INTO indicator.concept (name) VALUES (\'smoking\');' },
      { version: 6, statement: 'INSERT INTO indicator.concept (name) VALUES (\'active patients\');' },
      { version: 7, statement: 'INSERT INTO indicator.concept (name) VALUES (\'something else\');' },
      { version: 8, statement: 'INSERT INTO indicator.concept (name) VALUES (\'gender\');' },
  ];

  const myQueries = [
    { id: 1, indicator: 'diabetic_prevalence', clinic: '123', provider: 50000, effectiveDate: '2016-01-01' },
    { id: 2, indicator: 'copd_prevalence', clinic: '123', provider: 50000, effectiveDate: '2016-01-01' },
    { id: 3, indicator: 'chf_prevalence', clinic: '123', provider: 50000, effectiveDate: '2016-01-01' },
    { id: 4, indicator: 'diabetic_prevalence', clinic: '123', provider: 50001, effectiveDate: '2016-01-01' },
    { id: 5, indicator: 'copd_prevalence', clinic: '123', provider: 50001, effectiveDate: '2016-01-01' },
    { id: 6, indicator: 'chf_prevalence', clinic: '123', provider: 50001, effectiveDate: '2016-01-01' },
    { id: 7, indicator: 'diabetic_prevalence', clinic: '123', provider: 50000, effectiveDate: '2015-01-01' },
    { id: 8, indicator: 'copd_prevalence', clinic: '123', provider: 50000, effectiveDate: '2015-01-01-01' },
    { id: 9, indicator: 'chf_prevalence', clinic: '123', provider: 50000, effectiveDate: '2015-01-01' },
    { id: 10, indicator: 'diabetic_prevalence', clinic: '123', provider: 50001, effectiveDate: '2015-01-01' },
    { id: 11, indicator: 'copd_prevalence', clinic: '123', provider: 50001, effectiveDate: '2015-01-01' },
    { id: 12, indicator: 'chf_prevalence', clinic: '123', provider: 50001, effectiveDate: '2015-01-01' },
  ];

  const myResults = [

  ];

  const NO_UPDATES_FOUND = 'No Updated Found';
  const NO_QUERIES_FOUND = 'No Queries Found';
  /**
   * Request a new batch of updates from the HDC Central server.
   */
  function requestUpdates(currentVersion, callback) {
    logger.debug('central.requestUpdates()', currentVersion);

    const required =
        myUpdates
        .filter(x => x.version > currentVersion)
        .sort((v1, v2) => v1 - v2)
        .slice(0, 3);

    if (required.length === 0) {
      return callback(NO_UPDATES_FOUND);
    }

    return callback(null, required);
  }

  /**
   * Request a new batch of queries from the HDC Central server.
   */
  function requestQueries(callback) {
    logger.debug('central.requestQueries()');

    const required =
      myQueries
      .filter(q => !myResults.find(r => r.query.id === q.id))
      .slice(0, 3);

    if (required.length === 0) {
      return callback(NO_QUERIES_FOUND);
    }

    return callback(null, required);
  }

  /**
   * Sends the result of queries back to the central server.
   */
  function sendResults(results, callback) {
    logger.debug('central.sendResults()', results);

    // Append the new results to our overall list of results
    myResults.push(...results);

    callback(null, null);
  }

  return {
    requestUpdates,
    requestQueries,
    sendResults,
    NO_UPDATES_FOUND,
    NO_QUERIES_FOUND,
  };
}());
