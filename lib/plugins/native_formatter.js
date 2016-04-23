'use strict';

const pp = require('plugin-party');
const util = require('util');

/**
 * NativeFormatter formats input data using `util.format`
 *
 * @class NativeFormatter
 * @extends Plugin
 */
const Native = pp.plugin({
  name: 'native',
  type: 'formatter'
});

Native.prototype.fmt = function (level, params, args) {
  return util.format.apply(util, args);
};

Native.prototype.configure = function () {

};

module.exports = Native;
