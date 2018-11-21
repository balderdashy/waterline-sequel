/**
 * Helper functions
 */

var _ = require('lodash');

// Module Exports

var utils = module.exports = {};

/**
* Safe hasOwnProperty
*/

utils.object = {};

/**
* Safer helper for hasOwnProperty checks
*
* @param {Object} obj
* @param {String} prop
* @return {Boolean}
* @api public
*/

var hop = Object.prototype.hasOwnProperty;
utils.object.hasOwnProperty = function(obj, prop) {
  return hop.call(obj, prop);
};


/**
 * Escape Name
 *
 * Wraps a name in quotes to allow reserved
 * words as table or column names such as user.
 *
 *
 * NOTE: do not use this method to escape strings in a general-purpose way.
 * This is intended only to escape schema object (e.g. table and column) names.
 * Check out utils.escapeString() for other purposes.  No harm in taking a
 * peek at https://dev.mysql.com/doc/refman/5.7/en/identifiers.html .
 */

utils.escapeName = function escapeName(name, identifierCharacter, schemaName) {
  var regex = new RegExp(identifierCharacter, 'g');
  var replacementString = '' + identifierCharacter + identifierCharacter;
  var replacementDot = '\.';
  if (schemaName && schemaName[name]) {
    return utils.escapeName(schemaName[name], identifierCharacter) + '.' +
    utils.escapeName(name, identifierCharacter);
  }
  return '' + identifierCharacter + name.replace(regex, replacementString).replace(/\./g, replacementDot) + identifierCharacter;
};

/**
* Return wrapped string value with escapeCharacter
*
* @param {String} value
* @param {String} escapeCharacter
* @return {String}
*/
utils.wrapValue = function wrapValue(value, escapeCharacter) {
  return escapeCharacter + value + escapeCharacter;
};

/**
 * Populate alias. Create the alias for an association
 *
 * @param {string} alias
 *
 * @returns {string}
 */

utils.populationAlias = function (alias) {
  return '__' + alias;
};

/**
 * Map Attributes
 *
 * Takes a js object and creates arrays used for parameterized
 * queries in postgres.
 */

utils.mapAttributes = function(data, options) {
  var keys = [],   // Column Names
      values = [], // Column Values
      params = [], // Param Index, ex: $1, $2
      i = 1;

  // Flag whether to use parameterized queries or not
  var parameterized = options && utils.object.hasOwnProperty(options, 'parameterized') ? options.parameterized : true;

  // Get the escape character
  var identifierCharacter = options && utils.object.hasOwnProperty(options, 'identifierCharacter') ? options.identifierCharacter : '`';

  // Determine if we should escape the inserted characters
  var escapeInserts = options && utils.object.hasOwnProperty(options, 'escapeInserts') ? options.escapeInserts : false;

  _.each(_.keys(data), function(key) {
    var k = escapeInserts ? (options.identifierCharacter + key + options.identifierCharacter) : key;
    keys.push(k);

    var value = utils.prepareValue(data[key]);

    values.push(value);

    if(parameterized) {
      params.push('$' + i);
    }
    else {
      if(value === null || value === undefined) {
        params.push('null');
      }
      else {
        params.push(value);
      }
    }

    i++;
  });

  return({ keys: keys, values: values, params: params });
};

/**
 * Prepare values
 *
 * Transform a JS date to SQL date and functions
 * to strings.
 */

utils.prepareValue = function(value) {

  // Cast dates to SQL
  if (_.isDate(value)) {
    value = utils.toSqlDate(value);
  }

  // Cast functions to strings
  if (_.isFunction(value)) {
    value = value.toString();
  }

  // Store Arrays as strings
  if (_.isArray(value)) {
    value = JSON.stringify(value);
  }

  // Store Buffers as hex strings (for BYTEA)
  if (Buffer.isBuffer(value)) {
    value = '\\x' + value.toString('hex');
  }

  return value;
};

/**
 * Escape Strings
 */

utils.escapeString = function(value, forLike) {
  if(!_.isString(value)) return value;

  value = value.replace(/[_%\0\n\r\b\t\\\'\"\x1a]/g, function(s) {
    switch(s) {
      case '\0': return '\\0';
      case '\n': return '\\n';
      case '\r': return '\\r';
      case '\b': return '\\b';
      case '\t': return '\\t';
      case '\x1a': return '\\Z';
      case '%': return forLike ? '\\%' : '%';
      case '_': return forLike ? '\\_' : '_';
      default: return '\\'+s;
    }
  });

  return value;
};

/**
 * JS Date to UTC Timestamp
 *
 * Dates should be stored in Postgres with UTC timestamps
 * and then converted to local time on the client.
 */

utils.toSqlDate = function(date) {
  return date.toUTCString();
};
