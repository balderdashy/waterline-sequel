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

var SelectBuilder = module.exports = function(schema, currentTable, queryObject, options) {

  this.schema = schema;
  this.currentTable = currentTable;
  this.escapeCharacter = '"';
  this.cast = false;

  if(options && hop(options, 'escapeCharacter')) {
    this.escapeCharacter = options.escapeCharacter;
  }

  if(options && hop(options, 'cast')) {
    this.cast = options.cast;
  }

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

  // Check for aggregations
  var aggregations = this.processAggregates(queryObject);
  if(aggregations) {
    return aggregations;
  }

  // Escape table name
  var tableName = utils.escapeName(self.currentTable, self.escapeCharacter);

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
    _.keys(self.schema[population.child].attributes).forEach(function(key) {
      var schema = self.schema[population.child].attributes[key];
      if(hop(schema, 'collection')) return;
      selectKeys.push({ table: population.child, key: key, alias: population.alias });
    });
  });

  // Add all the columns to be selected
  selectKeys.forEach(function(select) {

    // If there is an alias, set it in the select (used for hasFK associations)
    if(select.alias) {
      query += utils.escapeName(select.table, self.escapeCharacter) + '.' + utils.escapeName(select.key, self.escapeCharacter) + ' AS ' + self.escapeCharacter + select.alias + '___' + select.key + self.escapeCharacter + ', ';
    }
    else {
      query += utils.escapeName(select.table, self.escapeCharacter) + '.' + utils.escapeName(select.key, self.escapeCharacter) + ', ';
    }

  });

  // Remove the last comma
  query = query.slice(0, -2) + ' FROM ' + tableName + ' ';

  return query;
};


/**
 * Aggregates
 *
 */

SelectBuilder.prototype.processAggregates = function processAggregates(criteria) {

  var self = this;

  if(!criteria.groupBy && !criteria.sum && !criteria.average && !criteria.min && !criteria.max) {
    return false;
  }

  // Error if groupBy is used and no calculations are given
  if(!criteria.sum && !criteria.average && !criteria.min && !criteria.max) {
    throw new Error('An aggregation was used but no calculations were given');
  }


  var query = 'SELECT ';
  var tableName = utils.escapeName(this.currentTable, this.escapeCharacter);

  // Append groupBy columns to select statement
  if(criteria.groupBy) {
    if(criteria.groupBy instanceof Array) {
      criteria.groupBy.forEach(function(opt) {
        query += tableName + '.' + utils.escapeName(opt, self.escapeCharacter) + ', ';
      });

    } else {
      query += tableName + '.' + utils.escapeName(criteria.groupBy, self.escapeCharacter) + ', ';
    }
  }

  // Handle SUM
  if (criteria.sum) {
    var sum = '';
    if(criteria.sum instanceof Array) {
      criteria.sum.forEach(function(opt) {
        sum = 'SUM(' + tableName + '.' + utils.escapeName(opt, self.escapeCharacter) + ')';
        if(self.cast) {
          sum = 'CAST(' + sum + ') AS float)';
        }
        query += sum + ' AS ' + opt + ', ';
      });

    } else {
      sum = 'SUM(' + tableName + '.' + utils.escapeName(criteria.sum, self.escapeCharacter) + ')';
      if(self.cast) {
        sum = 'CAST(' + sum + ') AS float)';
      }
      query += sum + ' AS ' + criteria.sum + ', ';
    }
  }

  // Handle AVG (casting to float to fix percision with trailing zeros)
  if (criteria.average) {
    var avg = '';
    if(criteria.average instanceof Array) {
      criteria.average.forEach(function(opt){
        avg = 'AVG(' + tableName + '.' + utils.escapeName(opt, self.escapeCharacter) + ')';
        if(self.cast) {
          avg = 'CAST( ' + avg + ') AS float)';
        }
        query +=  avg + ' AS ' + opt + ', ';
      });
    } else {
      avg = 'AVG(' + tableName + '.' + utils.escapeName(criteria.average, self.escapeCharacter) + ')';
      if(self.cast) {
        avg = 'CAST( ' + avg + ') AS float)';
      }
      query += avg + ' AS ' + criteria.average + ', ';
    }
  }

  // Handle MAX
  if (criteria.max) {
    var max = '';
    if(criteria.max instanceof Array) {
      criteria.max.forEach(function(opt){
        query += 'MAX(' + tableName + '.' + utils.escapeName(opt, self.escapeCharacter) + ') AS ' + opt + ', ';
      });

    } else {
      query += 'MAX(' + tableName + '.' + utils.escapeName(criteria.max, self.escapeCharacter) + ') AS ' + criteria.max + ', ';
    }
  }

  // Handle MIN
  if (criteria.min) {
    if(criteria.min instanceof Array) {
      criteria.min.forEach(function(opt){
        query += 'MIN(' + tableName + '.' + utils.escapeName(opt, self.escapeCharacter) + ') AS ' + opt + ', ';
      });

    } else {
      query += 'MIN(' + tableName + '.' + utils.escapeName(criteria.min, self.escapeCharacter) + ') AS ' + criteria.min + ', ';
    }
  }

  // trim trailing comma
  query = query.slice(0, -2) + ' ';

  // Add FROM clause
  return query += 'FROM ' + tableName + ' ';
};
