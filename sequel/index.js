/**
 * Module dependencies
 */

var _ = require('lodash');

var SelectBuilder = require('./select');
var WhereBuilder = require('./where');


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
 * Build a SQL Query using the defined schema.
 */

Sequel.prototype.buildQuery = function buildQuery(currentTable, queryObject) {

  // Step 1:
  // Build out the Select statements
  var selectObject = this.select(currentTable, queryObject);
  this.queries = selectObject.select;

  // Step 2:
  // If this is a complex query, meaning it can't be done in a single query because of the use of
  // SKIP, LIMIT or SORT on the populate, then build up a simple WHERE clause if needed.
  // Otherwise pass the whole criteria object into the where module so it can build joins.
  var whereObject;
  var query;
  var values;

  if(selectObject.complex) {
    var tmpCriteria = _.cloneDeep(queryObject);
    delete tmpCriteria.instructions;
    whereObject = this.simpleWhere(currentTable, tmpCriteria);

    // Grab the first query in the array
    query = this.queries[0];
    values = this.values[0];

    query += whereObject.query;
    values = whereObject.values;
  }


  return {
    query: this.queries,
    values: this.values
  };

};


/**
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
