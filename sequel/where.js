/**
 * Module dependecies
 */

var _ = require('lodash');
var CriteriaParser = require('./lib/criteriaProcessor');
var utils = require('./lib/utils');
var hop = utils.object.hasOwnProperty;

/**
 * Build WHERE query clause
 *
 * `Where` conditions may use key/value model attributes for simple query
 * look ups as well as more complex conditions.
 *
 * The following conditions are supported along with simple criteria:
 *
 *   Conditions:
 *     [And, Or, Like, Not]
 *
 *   Criteria Operators:
 *     [<, <=, >, >=, !]
 *
 *   Criteria Helpers:
 *     [lessThan, lessThanOrEqual, greaterThan, greaterThanOrEqual, not, like, contains, startsWith, endsWith]
 *
 * ####Example
 *
 *   where: {
 *     name: 'foo',
 *     age: {
 *       '>': 25
 *     },
 *     like: {
 *       name: '%foo%'
 *     },
 *     or: [
 *       { like: { foo: '%foo%' } },
 *       { like: { bar: '%bar%' } }
 *     ],
 *     name: [ 'foo', 'bar;, 'baz' ],
 *     age: {
 *       not: 40
 *     }
 *   }
 */

var WhereBuilder = module.exports = function WhereBuilder(schema, currentTable) {

  this.schema = schema;
  this.currentTable = currentTable;

  return this;
};


/**
 * Build a Simple Where clause
 */

WhereBuilder.prototype.single = function single(queryObject) {

  if(!queryObject) return '';

  var self = this;
  var queryString = '';
  var addSpace = false;

  // Add any hasFK strategy joins to the main query
  _.keys(queryObject.instructions).forEach(function(attr) {

    var strategy = queryObject.instructions[attr].strategy.strategy;
    var population = queryObject.instructions[attr].instructions[0];

    // Handle hasFK
    if(strategy === 1) {

      // Set outer join logic
      queryString += 'LEFT OUTER JOIN ' + utils.escapeName(population.child) + ' ON ';
      queryString += utils.escapeName(population.parent) + '.' + utils.escapeName(population.parentKey);
      queryString += ' = ' + utils.escapeName(population.child) + '.' + utils.escapeName(population.childKey);

      addSpace = true;
    }
  });

  if(addSpace) {
    queryString += ' ';
  }

  var tmpCriteria = _.cloneDeep(queryObject);
  delete tmpCriteria.instructions;

  // Ensure a sort is always set so that we get back consistent results
  if(!hop(queryObject, 'sort')) {
    var childPK;

    _.keys(this.schema[this.currentTable].attributes).forEach(function(attr) {
      if(!hop(self.schema[self.currentTable].attributes[attr], 'primaryKey')) return;
      childPK = attr;
    });

    queryObject.sort = {};
    queryObject.sort[childPK] = -1;
  }

  // Read the queryObject and get back a query string and params
  // Use the tmpCriteria here because all the joins have been removed
  var parsedCriteria = {};
  if(tmpCriteria.where) {
    // Build up a WHERE queryString
    queryString += 'WHERE ';

    this.criteriaParser = new CriteriaParser(this.currentTable, this.schema);
    parsedCriteria = this.criteriaParser.read(tmpCriteria);
    queryString += parsedCriteria.query;
  }

  // Remove trailing AND if it exists
  if(queryString.slice(-4) === 'AND ') {
    queryString = queryString.slice(0, -5);
  }

  // Remove trailing OR if it exists
  if(queryString.slice(-3) === 'OR ') {
    queryString = queryString.slice(0, -4);
  }

  return {
    query: queryString,
    values: parsedCriteria.values || []
  };
};

/**
 * Build a template for a complex UNION query. This is needed when populating using
 * SKIP, SORT and LIMIT.
 */

WhereBuilder.prototype.complex = function complex(queryObject) {

  var self = this;
  var queries = [];

  // Look up the child instructions and build out a template for each based on the type of join.
  if(!queryObject) return '';

  _.keys(queryObject.instructions).forEach(function(attr) {

    var queryString = '';
    var criteriaParser;
    var parsedCriteria;

    var strategy = queryObject.instructions[attr].strategy.strategy;
    var population = queryObject.instructions[attr].instructions[0];

    // Handle viaFK
    if(strategy === 2) {

      // Build the WHERE part of the query string
      criteriaParser = new CriteriaParser(population.child, self.schema);

      // Ensure a sort is always set so that we get back consistent results
      if(!hop(population.criteria, 'sort')) {
        var childPK;

        _.keys(self.schema[population.child].attributes).forEach(function(attr) {
          if(!hop(self.schema[population.child].attributes[attr], 'primaryKey')) return;
          childPK = attr;
        });

        population.criteria.sort = {};
        population.criteria.sort[childPK] = 1;
      }

      // Read the queryObject and get back a query string and params
      parsedCriteria = criteriaParser.read(population.criteria);

      queryString = '(SELECT * FROM ' + utils.escapeName(population.child) + ' WHERE ' + utils.escapeName(population.childKey) + ' = ^?^ ';
      if(parsedCriteria) {

        // If where criteria was used append an AND clause
        if(population.criteria.where && _.keys(population.criteria.where).length > 0) {
          queryString += 'AND ';
        }

        queryString += parsedCriteria.query;
      }

      queryString += ')';

      // Add to the query list
      queries.push({
        qs: queryString,
        instructions: population,
        attrName: attr,
        values: parsedCriteria.values
      });
    }

    // Handle viaJunctor
    else if(strategy === 3) {

    }
  });

  return queries;
};
