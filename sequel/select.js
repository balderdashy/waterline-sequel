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
  this.currentSchema = schema[currentTable].definition;
  this.currentTable = currentTable;
  this.escapeCharacter = '"';
  this.cast = false;
  this.wlNext = {};

  if(options && hop(options, 'escapeCharacter')) {
    this.escapeCharacter = options.escapeCharacter;
  }

  if(options && hop(options, 'cast')) {
    this.cast = options.cast;
  }

  // Add support for WLNext features
  if(options && hop(options, 'wlNext')) {
    this.wlNext = options.wlNext;
  }

  if(options && hop(options, 'schemaName')) {
    this.schemaName = options.schemaName;
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
  var tableName = utils.escapeName(self.schema[self.currentTable].tableName, self.escapeCharacter, self.schemaName);

  var selectKeys = [];
  var query = 'SELECT ';

  // If there is a select projection, ensure that the primary key is added.
  var pk;
  _.each(this.schema[this.currentTable].definition, function(val, key) {
    if(_.has(val, 'primaryKey') && val.primaryKey) {
      pk = key;
    }
  });

  if(pk && queryObject.select && !_.includes(queryObject.select, pk)) {
    queryObject.select.push(pk);
  }

  var attributes = queryObject.select || _.keys(this.schema[this.currentTable].definition);
  delete queryObject.select;

  _.each(attributes, function(key) {
    // Default schema to {} in case a raw DB column name is sent.  This shouldn't happen
    // after https://github.com/balderdashy/waterline/commit/687c869ad54f499018ab0b038d3de4435c96d1dd
    // but leaving here as a failsafe.
    var schema = self.schema[self.currentTable].definition[key] || {};
    if(!schema) return;
    if(hop(schema, 'collection')) return;
    selectKeys.push({ table: self.currentTable, key: schema.columnName || key });
  });

  // Add any hasFK strategy joins to the main query
  _.each(_.keys(queryObject.instructions), function(attr) {

    var strategy = queryObject.instructions[attr].strategy.strategy;
    if(strategy !== 1) return;

    var population = queryObject.instructions[attr].instructions[0];

    // Handle hasFK
    var childAlias = _.find(_.values(self.schema), {tableName: population.child}).tableName;

    // Ensure the foreignKey is selected if a custom select was defined
    if(population.select && !_.includes(population.select, population.childKey)) {
      population.select.push(population.childKey);
    }

    var attributes = population.select || _.keys(self.schema[childAlias].definition);
    _.each(attributes, function(key) {
      var schema = self.schema[childAlias].definition[key];
      if(!schema) return;
      if(hop(schema, 'collection')) return;
      selectKeys.push({ table: population.alias ? '__' + population.alias : population.child, key: schema.columnName || key, alias: population.parentKey });
    });
  });

  // Add all the columns to be selected
  _.each(selectKeys, function(select) {
    // If there is an alias, set it in the select (used for hasFK associations)
    if(select.alias) {
      query += utils.escapeName(select.table, self.escapeCharacter) + '.' + utils.escapeName(select.key, self.escapeCharacter) + ' AS ' + self.escapeCharacter + select.alias + '___' + select.key + self.escapeCharacter + ', ';
    }
    else {
      query += utils.escapeName(select.table, self.escapeCharacter) + '.' + utils.escapeName(select.key, self.escapeCharacter) + ', ';
    }
  });

  // Remove the last comma in a list of items being selected
  if(selectKeys.length) {
    query = query.slice(0, -2);
  } else {
    query += '*';
  }

  query = query + ' FROM ' + tableName + ' AS ' + utils.escapeName(self.currentTable, self.escapeCharacter) + ' ';
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
    if(!_.isArray(criteria.groupBy)) criteria.groupBy = [criteria.groupBy];

    _.each(criteria.groupBy, function(key, index) {
      // Check whether we are grouping by a column or an expression.
      if (_.includes(_.keys(self.currentSchema), key)) {
        query += tableName + '.' + utils.escapeName(key, self.escapeCharacter) + ', ';
      } else {
        query += key + ' as group' + index + ', ';
      }
    });
  }

  // Handle SUM
  if (criteria.sum) {
    var sum = '';
    if(_.isArray(criteria.sum)) {
      _.each(criteria.sum, function(opt) {
        sum = 'SUM(' + tableName + '.' + utils.escapeName(opt, self.escapeCharacter) + ')';
        if(self.cast) {
          sum = 'CAST(' + sum + ' AS float)';
        }
        query += sum + ' AS ' + opt + ', ';
      });

    } else {
      sum = 'SUM(' + tableName + '.' + utils.escapeName(criteria.sum, self.escapeCharacter) + ')';
      if(self.cast) {
        sum = 'CAST(' + sum + ' AS float)';
      }
      query += sum + ' AS ' + criteria.sum + ', ';
    }
  }

  // Handle AVG (casting to float to fix percision with trailing zeros)
  if (criteria.average) {
    var avg = '';
    if(_.isArray(criteria.average)) {
      _.each(criteria.average, function(opt){
        avg = 'AVG(' + tableName + '.' + utils.escapeName(opt, self.escapeCharacter) + ')';
        if(self.cast) {
          avg = 'CAST( ' + avg + ' AS float)';
        }
        query +=  avg + ' AS ' + opt + ', ';
      });
    } else {
      avg = 'AVG(' + tableName + '.' + utils.escapeName(criteria.average, self.escapeCharacter) + ')';
      if(self.cast) {
        avg = 'CAST( ' + avg + ' AS float)';
      }
      query += avg + ' AS ' + criteria.average + ', ';
    }
  }

  // Handle MAX
  if (criteria.max) {
    var max = '';
    if(_.isArray(criteria.max)) {
      _.each(criteria.max, function(opt){
        query += 'MAX(' + tableName + '.' + utils.escapeName(opt, self.escapeCharacter) + ') AS ' + opt + ', ';
      });

    } else {
      query += 'MAX(' + tableName + '.' + utils.escapeName(criteria.max, self.escapeCharacter) + ') AS ' + criteria.max + ', ';
    }
  }

  // Handle MIN
  if (criteria.min) {
    if(_.isArray(criteria.min)) {
      _.each(criteria.min, function(opt){
        query += 'MIN(' + tableName + '.' + utils.escapeName(opt, self.escapeCharacter) + ') AS ' + opt + ', ';
      });

    } else {
      query += 'MIN(' + tableName + '.' + utils.escapeName(criteria.min, self.escapeCharacter) + ') AS ' + criteria.min + ', ';
    }
  }

  // trim trailing comma
  query = query.slice(0, -2) + ' ';

  // Add FROM clause
  query += 'FROM ' + utils.escapeName(self.schema[self.currentTable].tableName, self.escapeCharacter, self.schemaName) + ' AS ' + tableName + ' ';
  return query;
};
