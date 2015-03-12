var assert      = require('chai').assert,
    Sequel      = require('../../sequel'),
    schema      = require('../schema'),
    options     = require('../options'),
    simpleQuery = require('../queries/simple');

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
    context('With a simple query', function () {
      it('Should properly construct the query we desire.', function (done) {
        var sequel      = new Sequel(schema, options),
            selectQuery = sequel.select(simpleQuery.table, simpleQuery.query);

        assert.property(selectQuery, 'select');
        assert.isArray(selectQuery.select);
        assert.lengthOf(selectQuery.select, 1);
        assert.strictEqual(selectQuery.select[0], simpleQuery.result);

        done();
      });
    });
  });
});
