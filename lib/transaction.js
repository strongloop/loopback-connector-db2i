// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: loopback-connector-db2iseries
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var debug = require('debug')('loopback:connector:db2iseries');
var Transaction = require('loopback-connector').Transaction;

module.exports = mixinTransaction;

var mapIsolationLevel = function(isolationLevelString) {
  switch (isolationLevelString) {
    case Transaction.READ_UNCOMMITTED:
      ret = 1;
      break;
    case Transaction.READ_COMMITTED:
      ret = 2;
      break;
    case Transaction.SERIALIZABLE:
      ret = 4;
      break;
    case Transaction.REPEATABLE_READ:
      ret = 8;
      break;
    default:
      ret = 2;
      break;
  }

  return ret;
};

/*!
 * @param {DB2} DB2 connector class
 */
function mixinTransaction(DB2, db2) {
  /**
   * Begin a new transaction

   * @param {Integer} isolationLevel
   * @param {Function} cb
   */
  DB2.prototype.beginTransaction = function(isolationLevel, cb) {
    debug('beginTransaction: isolationLevel: %s', isolationLevel);

    var self = this;

    self.client.open(self.connStr, function(err, connection) {
      if (err) return cb(err);
      connection.beginTransaction(function(err) {
        if (isolationLevel) {
          connection.setIsolationLevel(mapIsolationLevel(isolationLevel));
        }

        cb(err, connection);
      });
    });
  };

  /**
   * Commit a transaction
   *
   * @param {Object} connection
   * @param {Function} cb
   */
  DB2.prototype.commit = function(connection, cb) {
    debug('Commit a transaction');
    connection.commitTransaction(function(err) {
      if (err) return cb(err);
      connection.close(cb);
    });
  };

  /**
   * Roll back a transaction
   *
   * @param {Object} connection
   * @param {Function} cb
   */
  DB2.prototype.rollback = function(connection, cb) {
    debug('Rollback a transaction');
    connection.rollbackTransaction(function(err) {
      if (err) return cb(err);
      // connection.setAutoCommit(true);
      connection.close(cb);
    });
  };
}
