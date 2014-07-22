/**
 * Helper functions
 */

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
 */

utils.escapeName = function escapeName(name) {
  return '"' + name + '"';
};
