var path = require('path');
var fs = require('fs');
var _ = require('lodash');

var ctx = require('./lib/context');

_.forEach(fs.readdirSync(path.join(__dirname, 'lib', 'plugins')), function (name) {
  var m = name.match(/^(.+)\.js$/);
  if(m && m.length === 2) {
    var Plugin = require('./lib/plugins/' + m[1]);
    ctx.register(Plugin);
  }
});


module.exports = function (options) {//logger factory
  return ctx.logger(options);
};
