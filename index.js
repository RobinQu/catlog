var ctx = require('./context');

module.exports = function (options) {//logger factory
  return ctx.logger(options);
};
