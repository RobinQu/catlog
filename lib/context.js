var _ = require('lodash');
var addLogMethod = require('./log_method');
var defaults = require('./defaults');

var Context = function () {
  this._options = {};
};

var proto = Context.prototype;

proto.configure = function (options) {
  this._options = _.extend(this._options, options || {});
  return this;
};

proto.logger = function (options) {
  if(typeof options === 'string') {
    options = {
      category: options
    };
  }
  var target = options.category ? addLogMethod('debug', {
    target: 'filter',
    level: 80,
    category: options.category
  }) : {};

  //merge methods
  var methods = _.defaults(defaults.methods, options.methods || {});
  _.forOwn(methods, function (v, k) {
    addLogMethod(k, v, target);
  });
  return target;
};

module.exports = new Context();
