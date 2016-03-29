var assert  = require('chai').assert,
    Sequel  = require('../../sequel'),
    schema  = require('../schema'),
    options = require('../options'),
    _       = require('lodash'),
    queries = require('../queries');
    schemaQueries = require('../schemaQueries');

describe('Sequel', function () {
  describe('constructor', function () {
    context('Without any arguments', function () {
      it('Should return an instance of Sequel', function (done) {
        var sequel = new Sequel();

        assert.instanceOf(sequel, Sequel);
        done();
      });
    });

    context('With arguments', function () {
      it('Should return an instance of Sequel', function (done) {
        var sequel = new Sequel(schema, options);

        assert.instanceOf(sequel, Sequel);
        done();
      });
    });
  });

  describe('.select()', function () {
    // Loop through the query objects and test them against the `.select()` method.
    // You can find the instructions in `test/queries`
    queries.forEach(function (query) {
      it(query.description, function (done) {
        var sequel      = new Sequel(schema, options),
            selectQuery = sequel.select(query.table, query.query);

        assert.property(selectQuery, 'select');
        assert.isArray(selectQuery.select);
        assert.lengthOf(selectQuery.select, query.expected.select.queriesReturned);
        assert.strictEqual(selectQuery.select[0], query.expected.select.queryString);

        done();
      });
    });
  });

  describe('.select() with schema name', function () {
    var _options = _.extend({}, options, {schemaName: {'foo':'myschema','oddity':'anotherschema','bat':'public'}});
    // Loop through the query objects and test them against the `.select()` method.
    // You can find the instructions in `test/queries`
    schemaQueries.forEach(function (query) {
      it(query.description, function (done) {
        var sequel      = new Sequel(schema, _options),
            selectQuery = sequel.select(query.table, query.query);

        assert.property(selectQuery, 'select');
        assert.isArray(selectQuery.select);
        assert.lengthOf(selectQuery.select, query.expected.select.queriesReturned);
        assert.strictEqual(selectQuery.select[0], query.expected.select.queryString);

        done();
      });
    });
  });

  describe('.find()', function () {
    // Loop through the query objects and test them against the `.find()` method.
    // You can find the instructions in `test/queries`
    queries.forEach(function (query) {
      it(query.description, function (done) {
        var sequel    = new Sequel(schema, options),
            findQuery = sequel.find(query.table, query.query);

        assert.property(findQuery, 'query');
        assert.isArray(findQuery.query);
        assert.lengthOf(findQuery.query, query.expected.find.queriesReturned);
        assert.strictEqual(findQuery.query[0], query.expected.find.queryString);

        done();
      });
    });
  });

  describe('queries with an unknown operator', function () {
    it('throws an error when the operator is unknown', function() {
      var sequel = new Sequel(schema);
      assert.throws(sequel.find.bind(sequel, 'bar', { id: { 'in': [ 1, 2 ] } }),
        Error, "Unknown filtering operator: \"in\". Should be 'startsWith', '>', 'contains' or similar");
    });
  });

  describe('.find() with schema name', function () {
    var _options = _.extend({}, options, {schemaName: {'foo':'myschema','oddity':'anotherschema','bat':'public'}});
    // Loop through the query objects and test them against the `.find()` method.
    // You can find the instructions in `test/queries`
    schemaQueries.forEach(function (query) {
      it(query.description, function (done) {
        var sequel    = new Sequel(schema, _options),
            findQuery = sequel.find(query.table, query.query);

        assert.property(findQuery, 'query');
        assert.isArray(findQuery.query);
        assert.lengthOf(findQuery.query, query.expected.find.queriesReturned);
        assert.strictEqual(findQuery.query[0], query.expected.find.queryString);

        done();
      });
    });
  });
});
