module.exports = {

  // A description. This is used for display in the test output.
  description: 'Should construct a nested filter select query using aliased property (not using the alias).',

  // The name of the table this query should be ran against.
  table      : 'oddity',

  // The query object used to build this query.
  query      : {
    where: {
      bar : {
        meta : 'foo'
      }
    }
  },

  // Expected results per query method.
  expected   : {

    // Sequel.select()
    select: {

      // The queryString we expect to be rendered after calling `Sequel.select()`
      queryString    : 'SELECT `oddity`.`meta`, `oddity`.`id`, `oddity`.`createdAt`, `oddity`.`updatedAt`, `oddity`.`stubborn`, `oddity`.`bat` FROM `anotherschema`.`oddity` AS `oddity` ',

      // The number of queries that will be returned after calling Sequel.select()
      queriesReturned: 1,
    },

    // Sequel.find()
    find  : {

      // The queryString we expect to be rendered after calling `Sequel.find()`
      queryString    : 'SELECT `oddity`.`meta`, `oddity`.`id`, `oddity`.`createdAt`, `oddity`.`updatedAt`, `oddity`.`stubborn`, `oddity`.`bat` FROM `anotherschema`.`oddity` AS `oddity`  WHERE `__bar`.`meta` = \'foo\'  ',

      // The number of queries that will be returned after calling Sequel.find()
      queriesReturned: 1
    }
  }
};
