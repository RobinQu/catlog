var ctx = require('./lib/context');

module.exports = function (options) {//logger factory
  return ctx.logger(options);
};

module.exports.configure = function (fn) {
  if(fn) {
    fn.call(ctx);
  }
};
