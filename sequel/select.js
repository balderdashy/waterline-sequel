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
  queries.push(this.buildSimpleSelect(queryObject));

  return {
    select: queries
  };
};

/**
 * Build a simple Select statement.
 */

SelectBuilder.prototype.buildSimpleSelect = function buildSimpleSelect(queryObject) {

  var self = this;

  // Escape table name
  var tableName = utils.escapeName(self.currentTable);

  var selectKeys = [];
  var query = 'SELECT ';

  Object.keys(this.schema[this.currentTable].attributes).forEach(function(key) {
    var schema = self.schema[self.currentTable].attributes[key];
    if(hop(schema, 'collection')) return;
    selectKeys.push({ table: self.currentTable, key: key });
  });

  // Add any hasFK strategy joins to the main query
  _.keys(queryObject.instructions).forEach(function(attr) {

    var strategy = queryObject.instructions[attr].strategy.strategy;
    if(strategy !== 1) return;

    var population = queryObject.instructions[attr].instructions[0];

    // Handle hasFK
    Object.keys(self.schema[population.child].attributes).forEach(function(key) {
      var schema = self.schema[population.child].attributes[key];
      if(hop(schema, 'collection')) return;
      selectKeys.push({ table: population.child, key: key, alias: population.alias });
    });
  });

  // Add all the columns to be selected
  selectKeys.forEach(function(select) {

    // If there is an alias, set it in the select (used for hasFK associations)
    if(select.alias) {
      query += utils.escapeName(select.table) + '.' + utils.escapeName(select.key) + ' AS "' + select.alias + '___' + select.key + '", ';
    }
    else {
      query += utils.escapeName(select.table) + '.' + utils.escapeName(select.key) + ', ';
    }

  });

  // Remove the last comma
  query = query.slice(0, -2) + ' FROM ' + tableName + ' ';

  return query;
};

