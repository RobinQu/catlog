var Context = require('./lib/context');

module.exports = Context.one.logger.bind(Context.one);

module.exports.Context = Context;
