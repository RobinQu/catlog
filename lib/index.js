'use strict';

const Context = require('./context');

module.exports = Context.one.logger.bind(Context.one);

module.exports.Context = Context;
