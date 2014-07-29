/**
 * Module dependencies
 */

var _ = require('lodash');

var SelectBuilder = require('./select');
var WhereBuilder = require('./where');
var utils = require('./lib/utils');


/**
 * Sequel generator
 *
 * Given a Waterline Query Object build a SQL query.
 */

var Sequel = module.exports = function(schema, options) {

  // Store the schema values for the database structure
  this.schema = schema || {};

  // To solve a query, multiple query strings may be needed.
  this.queries = [];

  this.values = [];

  return this;
};

/**
 * Build a SQL Find Query using the defined schema.
 */

Sequel.prototype.find = function find(currentTable, queryObject) {

  // Step 1:
  // Build out the Select statements
  var selectObject = this.select(currentTable, queryObject);
  this.queries = selectObject.select;

  var whereObject;
  var childQueries;
  var query;
  var values;

  /**
   * Step 2 - Build out the parent query.
   */

  whereObject = this.simpleWhere(currentTable, queryObject);

  this.queries[0] += ' ' + whereObject.query;
  this.values[0] = whereObject.values;

  /**
   * Step 3 - Build out the child query templates.
   */

  childQueries = this.complexWhere(currentTable, queryObject);
  this.queries = this.queries.concat(childQueries);

  return {
    query: this.queries,
    values: this.values
  };

};


/**
 * Build a SQL Create Query.
 *
 */

Sequel.prototype.create = function create(currentTable, data) {

  // Transform the Data object into arrays used in a parameterized query
  var attributes = utils.mapAttributes(data);
  var columnNames = attributes.keys.join(', ');
  var paramValues = attributes.params.join(', ');

  // Build Query
  var query = 'INSERT INTO ' + utils.escapeName(currentTable) + ' (' + columnNames + ') values (' + paramValues + ') RETURNING *';

  return { query: query, values: attributes.values };
};
 * Build the select statements for a query.
 */

Sequel.prototype.select = function select(currentTable, queryObject) {
  return new SelectBuilder(this.schema, currentTable, queryObject);
};

/**
 * Build the where statements for a query.
 */

Sequel.prototype.simpleWhere = function simpleWhere(currentTable, queryObject) {
  var where = new WhereBuilder(this.schema, currentTable);
  return where.single(queryObject);
};

Sequel.prototype.complexWhere = function complexWhere(currentTable, queryObject) {
  var where = new WhereBuilder(this.schema, currentTable);
  return where.complex(queryObject);
};
