/**
 * Module dependencies
 */

var _ = require('lodash');
var utils = require('./lib/utils');
var hop = utils.object.hasOwnProperty;

/**
 * Build Select statements.
 *
 * Given a Waterline Query Object determine which select statements will be needed.
 */

var SelectBuilder = module.exports = function(schema, currentTable, queryObject) {

  this.schema = schema;
  this.currentTable = currentTable;

  var queries = [];

  // Check if this query can be built using a single query
  var passedCheck = this.check(queryObject);

  if(passedCheck) {
    queries = queries.concat(this.buildComplexSelect(queryObject));
  }
  else {
    queries.push(this.buildSimpleSelect(queryObject));
  }

  return {
    complex: !passedCheck,
    select: queries
  };
};


/**
 * Determine if this can be built using a single query.
 *
 * The only time this would return false is when one of the associations has a limit, skip or sort
 * clause on it. If this is the case we can't do this in a single query (easily across databases).
 */

SelectBuilder.prototype.check = function check(queryObject) {

  var unionNeeded = false;

  // Look through each instruction and determine if the criteria has a skip, sort or limit clause.
  _.keys(queryObject.instructions).forEach(function(alias) {
    queryObject.instructions[alias].forEach(function(join) {
      if(!join.criteria) return;
      if(hop(join.criteria, 'skip')) unionNeeded = true;
      if(hop(join.criteria, 'sort')) unionNeeded = true;
      if(hop(join.criteria, 'limit')) unionNeeded = true;
    });
  });

  return !unionNeeded;
};

/**
 * Build a simple Select statement.
 */

SelectBuilder.prototype.buildSimpleSelect = function buildSimpleSelect() {

  var self = this;

  // Escape table name
  var tableName = utils.escapeName(self.currentTable);

  // Add all keys to the select statement for this table
  var query = 'SELECT ';

  var selectKeys = [];

  Object.keys(self.schema[self.currentTable].attributes).forEach(function(key) {
    var schema = self.schema[self.currentTable].attributes[key];
    if(hop(schema, 'collection')) return;
    selectKeys.push({ table: self.currentTable, key: key });
  });

  // Add all the columns to be selected for the parent
  selectKeys.forEach(function(select) {
    query += utils.escapeName(select.table) + '.' + utils.escapeName(select.key) + ', ';
  });

  // Remove the last comma
  query = query.slice(0, -2) + ' FROM ' + tableName + ' ';

  return query;
};

