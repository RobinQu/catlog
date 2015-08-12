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

  this.formatters = [];
  this.handlers = [];


  this.configure({
    plugins: [
      {type: 'formatter', name: 'simple'},
      {type: 'handler', name: 'fs'}
    ]
  });


};
util.inherits(Context, EE);

var proto = Context.prototype;

proto.addLogMethod = require('./log_method');

proto.configure = function (options) {
  this.options = _.extend(this.options, options || {});
  //normalize formatter and handler
  _.each(this.options.plugins, function (p) {
    if(pp.isPlugin(p)) {
      this.register(p);
      this.install(p.pluginType, p.pluginName);
    } else {
      this.install(p.type, p.name, p);
    }
  }, this);
  return this;
};

proto.logger = function (options) {
  options = options || {};
  if(typeof options === 'string') {
    options = {
      category: options
    };
  }
  var self = this;
  var target = options.category ? this.addLogMethod('debug', {
    target: 'stdout',
    level: 80,
    category: options.category,
    formatter: 'filtered',
    topic: 'filtered_debug'
  }) : {};

  //merge methods
  var methods = _.defaults(defaults.methods, options.methods || {});
  _.forOwn(methods, function (v, k) {
    self.addLogMethod(k, v, target);
  });
  if(!methods.log) {//map log to info
    this.addLogMethod('log', _.extend({topic: 'info'}, methods.info), target);
  }
  target.configure = function (fn) {
    return fn ? fn.call(self, self) : false;
  };
  return target;
};

proto.install = function (type, name, options) {
  try {
    this.plugin(type, name).configure(options, this);
    if(type === 'formatter') {
      this.formatters.push(name);
    } else if(type === 'handler') {
      this.handlers.push(name);
    }
  } catch(e) {
    console.error(e.stack);
    //Do nothing
  }
  return this;
};

proto.formatter = function (name) {//get formatter
  try {
    return this.plugin('formatter', name || this.formatters[0]);
  } catch(e) {
    console.error(e.stack);
    return fallback;
  }
};

Context.one = new Context();

module.exports = Context;
