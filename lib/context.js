var _ = require('lodash');
var util = require('util');
var EE = require('eventemitter3');
// var EE = require('events').EventEmitter;
var pp = require('plugin-party');
var path = require('path');
var fs = require('fs');


var defaults = require('./defaults');
// var raw = require('./raw');

//fallback formatter
var fallback = {
  fmt: function (level, params, args) {
    return util.format.apply(util, args);
  },
  configure: function () {}
};

var Context = function () {
  EE.call(this);
  this.options = {};
  pp(this);

  //load default plugins
  _.forEach(fs.readdirSync(path.join(__dirname, 'plugins')), function (name) {
    var m = name.match(/^(.+)\.js$/);
    if(m && m.length === 2) {
      var Plugin = require('./plugins/' + m[1]);
      if(pp.isPlugin(Plugin)) {
        this.register(Plugin);
      }
    }
  }, this);


  this.configure({
    formatter: 'simple',
    handler: 'fs'
  });


};
util.inherits(Context, EE);

var proto = Context.prototype;

var addLogMethod = proto.addLogMethod = require('./log_method');

proto.configure = function (options) {
  this.options = _.extend(this.options, options || {});
  //normalize formatter and handler
  _.each(['handler', 'formatter'], function (name) {
    this.options[name] = typeof this.options[name] === 'string' ? {name: this.options[name]} : this.options[name];
  }, this);
  this.formatter().configure(this.options.formatter);
  this.handler().configure(this.options.handler).bind(this);
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

proto.formatter = function (name) {
  try {
    return this.plugin('formatter', name || this.options.formatter.name);
  } catch(e) {
    return fallback;
  }
};

proto.handler = function (name) {
  try {
    return this.plugin('handler', name || this.options.handler.name);
  } catch(e) {
    console.log(e.stack);
    return fallback;
  }
};


module.exports = new Context();
