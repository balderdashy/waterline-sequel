var queries = [],
    fs      = require('fs'),
    path    = require('path');

require("fs").readdirSync(__dirname + '/').forEach(function (file) {
  if (file === path.basename(__filename)) {
    return;
  }

  queries.push(require("./" + file));
});

module.exports = queries;
