var _ = require('lodash');
var util = require('util');
var assert = require('assert');
var EE = require('eventemitter3');

var defaults = require('./defaults');
// var raw = require('./raw');

//fallback formatter
var fallback = {
  fmt: function (level, params, args) {
    return util.format.apply(util, args);
  }
};

var Context = function () {
  EE.call(this);
  this.options = {};
  this.configure({
    formatter: 'simple',
    handler: 'fs'
  });

  this.plugins = {};
  this.pluginInstances = {};
};
util.inherits(Context, EE);

var proto = Context.prototype;

var addLogMethod = proto.addLogMethod = require('./log_method');

proto.configure = function (options) {
  this.options = _.extend(this.options, options || {});
  return this;
};

proto.logger = function (options) {
  options = options || {};
  if(typeof options === 'string') {
    options = {
      category: options
    };
  }
  var target = options.category ? addLogMethod('debug', {
    target: 'stdout',
    level: 80,
    category: options.category,
    formatter: 'filtered'
  }) : {};

  //merge methods
  var methods = _.defaults(defaults.methods, options.methods || {});
  _.forOwn(methods, function (v, k) {
    addLogMethod(k, v, target);
  });
  if(!methods.log) {//map log to info
    addLogMethod('log', methods.info, target);
  }
  return target;
};

proto.register = function (Plugin) {
  assert(Plugin.pluginName && Plugin.pluginType && Plugin.create, 'should provide a valid plugin class');
  this.plugins[Plugin.pluginType + '_' + Plugin.pluginName] = Plugin;
  return this;
};

proto.unregister = function (type, name) {
  if(typeof type === 'function') {//a plugin instance or class is passed
    name = type.name;
    type = type.type;
  }
  delete this.plugins[type + '_' + name];
};

proto.plugin = function (type, name, options) {
  assert(type && name, 'should provide type and name to get plugin');
  var id = type + '_' + name;
  var instance = this.pluginInstances[id];
  if(!instance) {
    instance = this.pluginInstances[id] = this.plugins[id].create(options);
  }
  return instance;
};

proto.formatter = function (name) {
  name = name || this.options.formatter;
  try {
    return this.plugin('formatter', name);
  } catch(e) {
    return fallback;
  }
};


module.exports = new Context();
