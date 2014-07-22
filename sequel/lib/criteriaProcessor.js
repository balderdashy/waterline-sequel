/**
 * Module dependencies
 */

var _ = require('lodash');
var utils = require('./utils');

/**
 * Process Criteria
 *
 * Processes a query criteria object
 */

var CriteriaProcessor = module.exports = function CriteriaProcessor(currentTable, schema) {

  if(!currentTable || !schema) {
    throw new Error('Incorrect usage of CriteriaProcessor. Must include the currentTable and schema arguments.');
  }

  this.currentTable = currentTable;
  this.schema = schema;
  this.currentSchema = schema[currentTable].attributes;
  this.queryString = '';
  this.values = [];
  this.paramCount = 0;

  return this;
};


/**
 * Read criteria object and expand it into a sequel string.
 *
 * @param {Object} options
 */

CriteriaProcessor.prototype.read = function read(options) {

  var self = this;
  var _options;

  if(options.where) {
    _options = options.where;
  }
  else {
    _options = options;
  }

  _.keys(_options).forEach(function(key) {
    self.expand(key, _options[key]);
  });

  if(options.groupBy) this.groupBy(options.groupBy);
  if(options.sort) this.sort(options.sort);
  if(utils.object.hasOwnProperty(options, 'limit')) this.limit(options.limit);
  if(utils.object.hasOwnProperty(options, 'skip')) this.skip(options.skip);

  return {
    query: this.queryString,
    values: this.values
  };
};


/**
 * Expand a criteria piece.
 *
 * Given a key on a criteria object, expand it into it's sequel parts by inspecting which type
 * of operator to use (`or`, `and`, `in` or `like`) and then recursively process that key if needed.
 *
 * @param {String} key
 * @param {String || Object} val
 * @return
 */

CriteriaProcessor.prototype.expand = function expand(key, val) {

  var self = this;

  switch(key.toLowerCase()) {
    case 'or':
      self.or(val);
      return;

    case 'like':
      self.like(val);
      return;

    // Key/Value
    default:

      // `IN`
      if(val instanceof Array) {
        self._in(key, val);
        return;
      }

      // `AND`
      self.and(key, val);
      return;
  }
};


/**
 * Handle `OR` Criteria
 */

CriteriaProcessor.prototype.or = function or(val) {

  var self = this;

  if(!Array.isArray(val)) {
    throw new Error('`or` statements must be in an array.');
  }

  // Wrap the entire OR clause
  this.queryString += '(';

  val.forEach(function(statement) {
    self.queryString += '(';

    // Recursively call expand. Assumes no nesting of `or` statements
    self.expand('', statement);

    if(self.queryString.slice(-4) === 'AND ') {
      self.queryString = self.queryString.slice(0, -5);
    }

    self.queryString += ') OR ';
  });

  // Remove trailing OR if it exists
  if(self.queryString.slice(-3) === 'OR ') {
    self.queryString = self.queryStringy.slice(0, -4);
  }

  self.queryString += ') AND ';
};


/**
 * Handle `LIKE` Criteria
 */

CriteriaProcessor.prototype.like = function like(val) {

  var self = this;

  _.keys(val).forEach(function(parent) {
    self.queryString += expandBlock(parent);
  });

  var expandBlock = function(parent) {
    var caseSensitive = true;

    // Check if parent is a string, if so make sure it's case sensitive.
    if(self.currentSchema[parent] && self.currentSchema[parent].type === 'text') {
      caseSensitive = false;
    }

    self.process(parent, val[parent], 'ILIKE', caseSensitive);
    self.queryString += ' AND ';
  };
};


/**
 * Handle `AND` Criteria
 */

CriteriaProcessor.prototype.and = function and(key, val) {

  var caseSensitive = true;

  // Check if key is a string
  if(this.currentSchema[key] && this.currentSchema[key].type === 'text') {
    caseSensitive = false;
  }

  this.process(key, val, '=', caseSensitive);
  this.queryString += ' AND ';
};


/**
 * Handle `IN` Criteria
 */

CriteriaProcessor.prototype._in = function _in(key, val) {

  var self = this;

  // Set case sensitive by default
  var caseSensitivity = true;

  // Check if key is a string
  if(self.currentSchema[key] && self.currentSchema[key].type === 'text') {
    caseSensitivity = false;
  }

  // Check case sensitivity to decide if LOWER logic is used
  if(!caseSensitivity) {
    key = 'LOWER(' + utils.escapeName(self.currentTable) + '.' + utils.escapeName(key) + ')';
    self.queryString += key + ' IN (';
  } else {
    self.queryString += utils.escapeName(self.currentTable) + '.' + utils.escapeName(key) + ' IN (';
  }

  // Append each value to query
  options.forEach(function(value) {
    self.queryString += '$' + self.paramCount + ', ';
    self.paramCount++;

    // If case sensitivity if off lowercase the value
    if(!caseSensitivity) {
      value = value.toLowerCase();
    }

    self.values.push(value);
  });

  // Strip last comma and close criteria
  self.queryString = self.queryString.slice(0, -2) + ')';
  self.queryString += ' AND ';
};


/**
 * Process Criteria
 */

CriteriaProcessor.prototype.process = function process(parent, value, combinator, caseSensitive) {

  var self = this;

  // Expand criteria object
  function expandCriteria(obj) {
    var _param;

    _.keys(obj).forEach(function(key) {

      // If value is an object, recursivly expand it
      if(_.isPlainObject(obj[key])) {
        return expandCriteria(obj[key]);
      }

      // Check if value is a string and if so add LOWER logic
      // to work with case in-sensitive queries
      if(!caseSensitive && _.isString(obj[key])) {
        _param = 'LOWER(' + utils.escapeName(self.currentTable) + '.' + utils.escapeName(parent) + ')';
        obj[key] = obj[key].toLowerCase();
      } else {
        _param = utils.escapeName(self.currentTable) + '.' + utils.escapeName(parent);
      }

      self.queryString += _param + ' ';
      self.prepareCriterion(key, obj[key]);
      self.queryString += ' AND ';
    });
  }

  // Complex Object Attributes
  if(_.isPlainObject(value)) {

    // Expand the Object Criteria
    expandCriteria(value);

    // Remove trailing `AND`
    this.queryString = this.queryString.slice(0, -4);

    return;
  }

  // Check if value is a string and if so add LOWER logic
  // to work with case in-sensitive queries
  if(!caseSensitive && typeof value === 'string') {

    // ADD LOWER to parent
    parent = 'LOWER(' + utils.escapeName(self.currentTable) + '.' + utils.escapeName(parent) + ')';
    value = value.toLowerCase();

  } else {
    // Escape parent
    parent = utils.escapeName(self.currentTable) + '.' + utils.escapeName(parent);
  }

  if(value !== null) {

    // Simple Key/Value attributes
    this.queryString += parent + ' ' + combinator + ' $' + this.paramCount;

    this.values.push(value);
    this.paramCount++;
  }

  else {
    this.queryString += parent + ' IS NULL';
  }
};

/**
 * Prepare Criterion
 *
 * Processes comparators in a query.
 */

CriteriaProcessor.prototype.prepareCriterion = function prepareCriterion(key, value) {

  var str;

  switch(key) {

    case '<':
    case 'lessThan':
      this.values.push(value);
      str = '< ' + '$' + this.paramCount;
      break;

    case '<=':
    case 'lessThanOrEqual':
      this.values.push(value);
      str = '<= ' + '$' + this.paramCount;
      break;

    case '>':
    case 'greaterThan':
      this.values.push(value);
      str = '> ' + '$' + this.paramCount;
      break;

    case '>=':
    case 'greaterThanOrEqual':
      this.values.push(value);
      str = '>= ' + '$' + this.paramCount;
      break;

    case '!':
    case 'not':
      if(value === null) {
        this.query += 'IS NOT NULL';
        return;
      }
      else {
        // For array values, do a "NOT IN"
        if (Array.isArray(value)) {
          var self = this;
          this.values = this.values.concat(value);
          str = 'NOT IN (';
          var params = [];
          value.forEach(function() {
            params.push('$' + self.paramCount++);
          });
          str += params.join(',') + ')';

          // Roll back one since we bump the count at the end
          this.paramCount--;
        }
        // Otherwise do a regular <>
        else {
          this.values.push(value);
          str = '<> ' + '$' + this.paramCount;
        }
      }
      break;

    case 'like':
      this.values.push(value);
      str = 'ILIKE ' + '$' + this.paramCount;
      break;

    case 'contains':
      this.values.push('%' + value + '%');
      str = 'ILIKE ' + '$' + this.paramCount;
      break;

    case 'startsWith':
      this.values.push(value + '%');
      str = 'ILIKE ' + '$' + this.paramCount;
      break;

    case 'endsWith':
      this.values.push('%' + value);
      str = 'ILIKE ' + '$' + this.paramCount;
      break;
  }

  // Bump paramCount
  this.paramCount++;

  // Add str to query
  this.queryString += str;
};

/**
 * Specify a `limit` condition
 */

CriteriaProcessor.prototype.limit = function(options) {
  this.queryString += ' LIMIT ' + options;
};

/**
 * Specify a `skip` condition
 */

CriteriaProcessor.prototype.skip = function(options) {
  this.queryString += ' OFFSET ' + options;
};

/**
 * Specify a `sort` condition
 */

CriteriaProcessor.prototype.sort = function(options) {
  var self = this;

  this.queryString += ' ORDER BY ';

  Object.keys(options).forEach(function(key) {
    var direction = options[key] === 1 ? 'ASC' : 'DESC';
    self.queryString += utils.escapeName(self.currentTable) + '.' + utils.escapeName(key) + ' ' + direction + ', ';
  });

  // Remove trailing comma
  this.queryString = this.queryString.slice(0, -2);
};

/**
 * Specify a `group by` condition
 */

CriteriaProcessor.prototype.group = function(options) {
  var self = this;

  this.queryString += ' GROUP BY ';

  // Normalize to array
  if(!Array.isArray(options)) options = [options];

  options.forEach(function(key) {
    self.queryString += utils.escapeName(self.currentTable) + '.' + utils.escapeName(key) + ', ';
  });

  // Remove trailing comma
  this.queryString = this.queryString.slice(0, -2);
};
