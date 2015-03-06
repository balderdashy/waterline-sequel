var assert = require('assert');
var Sequel = require('../../../sequel/index.js');
var mysqlRequests = require('./requests/mysql.js');

var schema = {
   "user": {
      "connection": "semantic",
      "identity": "user",
      "tableName": "userTable",
      "migrate": "alter",
      "attributes": {
         "first_name": "string",
         "last_name": "string",
         "email": {
            "type": "string",
            "columnName": "emailAddress"
         },
         "title": "string",
         "phone": "string",
         "type": "string",
         "favoriteFruit": {
            "defaultsTo": "blueberry",
            "type": "string"
         },
         "age": "integer",
         "dob": "datetime",
         "status": {
            "type": "boolean",
            "defaultsTo": false
         },
         "percent": "float",
         "list": {
            "type": "array",
            "columnName": "arrList"
         },
         "obj": "json",
         "id": {
            "type": "integer",
            "autoIncrement": true,
            "primaryKey": true,
            "unique": true
         },
         "createdAt": {
            "type": "datetime",
            "default": "NOW"
         },
         "updatedAt": {
            "type": "datetime",
            "default": "NOW"
         }
      }
   }
};

var currentTable = "userTable";

var mysqlOptions = {
  parameterized: false,
  caseSensitive: false,
  escapeCharacter: '`',
  casting: false,
  canReturnValues: false,
  escapeInserts: true
};


describe('find', function(){
  describe('mysql column value', function(){
    it('should generate a mysql request to find rows on column value', function(){
      var queryObject = {
         "where": {
            "type": "column value"
         }
      };
      var sequel = new Sequel(schema, mysqlOptions);
      var query = sequel.find(currentTable, queryObject).query[0]; 
      if (query !== mysqlRequests['column value']) {
        var err = new Error('different from previous version');
        err.expected = mysqlRequests['column value'];
        err.actual = query;
        err.showDiff = true;
        throw err;
      }
    });
  });
});
