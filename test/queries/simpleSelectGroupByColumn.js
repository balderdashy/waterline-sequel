module.exports = {
  // A description. This is used for display in the test output.
  description: 'Should construct a simple select query with a simple column based group by.',

  // The name of the table this query should be ran against.
  table      : 'foo',

  // The query object used to build this query.
  query      : {"where": null, "groupBy": 'bar', "max": 'baz'},

  // Expected results per query method.
  expected   : {

    // Sequel.select()
    select: {

      // The queryString we expect to be rendered after calling `Sequel.select()`
      queryString    : 'SELECT `foo`.`bar`, MAX(`foo`.`baz`) AS baz FROM `foo` AS `foo` ',

      // The number of queries that will be returned after calling Sequel.select()
      queriesReturned: 1,
    },

    // Sequel.find()
    find  : {

      // The queryString we expect to be rendered after calling `Sequel.select()`
      queryString    : 'SELECT `foo`.`bar`, MAX(`foo`.`baz`) AS baz FROM `foo` AS `foo`   GROUP BY `foo`.`bar`',

      // The number of queries that will be returned after calling Sequel.select()
      queriesReturned: 1
    }
  }
};
