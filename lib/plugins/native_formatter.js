'use strict';

const pp = require('plugin-party');
const util = require('util');
const Native = pp.plugin({
  name: 'simple',
  type: 'formatter'
});

Native.prototype.fmt = function (level, params, args) {
  return util.format.apply(util, args);
};

Native.prototype.configure = function () {

};
