/**
 * Module dependecies
 */

var _ = require('lodash');
var CriteriaParser = require('./lib/criteriaProcessor');

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

  // Build up a WHERE queryString
  this.queryString = 'WHERE ';

  if(!queryObject) return '';

  this.criteriaParser = new CriteriaParser(this.currentTable, this.schema);

  // Read the queryObject and get back a query string and params
  var parsedCriteria = this.criteriaParser.read(queryObject);
  this.queryString += parsedCriteria.query;

  // Remove trailing AND if it exists
  if(this.queryString.slice(-4) === 'AND ') {
    this.queryString = this.queryString.slice(0, -5);
  }

  // Remove trailing OR if it exists
  if(this.queryString.slice(-3) === 'OR ') {
    this.queryString = this.queryString.slice(0, -4);
  }

  return {
    query: this.queryString,
    values: parsedCriteria.values
  };
};
