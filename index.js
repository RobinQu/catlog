var ctx = require('./lib/context');

module.exports = function (options) {//logger factory
  return ctx.logger(options);
};
