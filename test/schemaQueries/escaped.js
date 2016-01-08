module.exports = [
  {

    description: 'Should escape startsWith queries.',

    table: 'foo',

    query: {
      where: {
        color: { startsWith: '\\\\\\" OR 1=1; -- %_' }
      }
    },

    // Expected results per query method.
    expected: {

      // Sequel.select()
      select: {

        // The queryString we expect to be rendered after calling `Sequel.select()`
        queryString: 'SELECT `foo`.`color`, `foo`.`id`, `foo`.`createdAt`, `foo`.`updatedAt`, `foo`.`bar`, `foo`.`bat`, `foo`.`baz` FROM `myschema`.`foo` AS `foo` ',

        // The number of queries that will be returned after calling Sequel.select()
        queriesReturned: 1,
      },

      // Sequel.find()
      find: {

        // The queryString we expect to be rendered after calling Sequel.find()
        queryString: 'SELECT `foo`.`color`, `foo`.`id`, `foo`.`createdAt`, `foo`.`updatedAt`, `foo`.`bar`, `foo`.`bat`, `foo`.`baz` FROM `myschema`.`foo` AS `foo`  WHERE LOWER(`foo`.`color`) LIKE "\\\\\\\\\\\\\\" or 1=1; -- \\%\\_%"  ',

        // The number of queries that will be returned after calling Sequel.find()
        queriesReturned: 1
      }
    }
  },
  {

    description: 'Should escape endsWith queries.',

    table: 'foo',

    query: {
      where: {
        color: { endsWith: '\\\\\\" OR 1=1; -- %_' }
      }
    },

    // Expected results per query method.
    expected: {

      // Sequel.select()
      select: {

        // The queryString we expect to be rendered after calling `Sequel.select()`
        queryString: 'SELECT `foo`.`color`, `foo`.`id`, `foo`.`createdAt`, `foo`.`updatedAt`, `foo`.`bar`, `foo`.`bat`, `foo`.`baz` FROM `myschema`.`foo` AS `foo` ',

        // The number of queries that will be returned after calling Sequel.select()
        queriesReturned: 1,
      },

      // Sequel.find()
      find: {

        // The queryString we expect to be rendered after calling Sequel.find()
        queryString: 'SELECT `foo`.`color`, `foo`.`id`, `foo`.`createdAt`, `foo`.`updatedAt`, `foo`.`bar`, `foo`.`bat`, `foo`.`baz` FROM `myschema`.`foo` AS `foo`  WHERE LOWER(`foo`.`color`) LIKE "%\\\\\\\\\\\\\\" or 1=1; -- \\%\\_"  ',

        // The number of queries that will be returned after calling Sequel.find()
        queriesReturned: 1
      }
    }
  },
  {

    description: 'Should escape contains queries.',

    table: 'foo',

    query: {
      where: {
        color: { contains: '\\\\\\" OR 1=1; -- %_' }
      }
    },

    // Expected results per query method.
    expected: {

      // Sequel.select()
      select: {

        // The queryString we expect to be rendered after calling `Sequel.select()`
        queryString: 'SELECT `foo`.`color`, `foo`.`id`, `foo`.`createdAt`, `foo`.`updatedAt`, `foo`.`bar`, `foo`.`bat`, `foo`.`baz` FROM `myschema`.`foo` AS `foo` ',

        // The number of queries that will be returned after calling Sequel.select()
        queriesReturned: 1,
      },

      // Sequel.find()
      find: {

        // The queryString we expect to be rendered after calling Sequel.find()
        queryString: 'SELECT `foo`.`color`, `foo`.`id`, `foo`.`createdAt`, `foo`.`updatedAt`, `foo`.`bar`, `foo`.`bat`, `foo`.`baz` FROM `myschema`.`foo` AS `foo`  WHERE LOWER(`foo`.`color`) LIKE "%\\\\\\\\\\\\\\" or 1=1; -- \\%\\_%"  ',

        // The number of queries that will be returned after calling Sequel.find()
        queriesReturned: 1
      }
    }
  },
  {

    // Note that like queries are more permissive,
    // not escaping wildcard (& and _) characters
    description: 'Should escape like queries.',

    table: 'foo',

    query: {
      where: {
        color: { like: '\\\\\\" OR 1=1; -- %_' }
      }
    },

    // Expected results per query method.
    expected: {

      // Sequel.select()
      select: {

        // The queryString we expect to be rendered after calling `Sequel.select()`
        queryString: 'SELECT `foo`.`color`, `foo`.`id`, `foo`.`createdAt`, `foo`.`updatedAt`, `foo`.`bar`, `foo`.`bat`, `foo`.`baz` FROM `myschema`.`foo` AS `foo` ',

        // The number of queries that will be returned after calling Sequel.select()
        queriesReturned: 1,
      },

      // Sequel.find()
      find: {

        // The queryString we expect to be rendered after calling Sequel.find()
        queryString: 'SELECT `foo`.`color`, `foo`.`id`, `foo`.`createdAt`, `foo`.`updatedAt`, `foo`.`bar`, `foo`.`bat`, `foo`.`baz` FROM `myschema`.`foo` AS `foo`  WHERE LOWER(`foo`.`color`) LIKE "\\\\\\\\\\\\\\" or 1=1; -- %_"  ',

        // The number of queries that will be returned after calling Sequel.find()
        queriesReturned: 1
      }
    }
  }
];
