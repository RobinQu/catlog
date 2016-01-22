'use strict';

var pp = require('plugin-party');
var util = require('util');
var Native = pp.plugin({
  name: 'simple',
  type: 'formatter'
});

Native.prototype.fmt = function (level, params, args) {
  return util.format.apply(util, args);
};

Native.prototype.configure = function () {

};
