'use strict';

const _ = require('lodash');
const util = require('util');
const EE = require('eventemitter3');
// const EE = require('events').EventEmitter;
const pp = require('plugin-party');
const path = require('path');
const fs = require('fs');

//fallback formatter
const fallback = {
  fmt: function () {
    return false;
  },
  configure: function () {}
};

const Context = function (options) {
  EE.call(this);
  this.options = {};
  pp(this);

  //load default plugins
  _.forEach(fs.readdirSync(path.join(__dirname, 'plugins')), function (name) {
    const m = name.match(/^(.+)\.js$/);
    if(m && m.length === 2) {
      const Plugin = require('./plugins/' + m[1]);
      if(pp.isPlugin(Plugin)) {
        this.register(Plugin);
      }
    }
  }, this);

  this.formatters = [];
  this.handlers = [];


  this.configure(options || {
    plugins: [
      {type: 'formatter', name: 'simple'},
      {type: 'handler', name: 'fs'}
    ]
  });
};
util.inherits(Context, EE);

Context.defaults = require('./defaults');

const proto = Context.prototype;

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
  const self = this;
  const target = options.category ? this.addLogMethod('debug', {
    target: 'stdout',
    // level lower than 80 causes some handlers to skip log events from this logger
    level: 70,
    category: options.category,
    formatter: 'filtered',
    topic: 'filtered_debug'
  }) : {};

  //merge methods
  const methods = _.defaults(this.constructor.defaults.methods, options.methods || {});
  _.forOwn(methods, function (v, k) {
    self.addLogMethod(k, v, target);
  });
  if(!methods.log) {
    //map log to info
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
      if(this.formatters.indexOf(name) === -1) {
        this.formatters.push(name);
      }
    } else if(type === 'handler') {
      if(this.handlers.indexOf(name) === -1) {
        this.handlers.push(name);
      }
    }
  } catch(e) {
    console.error(e.stack);
    //Do nothing
  }
  return this;
};

proto.formatter = function (name) {
  name = name || this.formatters[0];
  if(name) {
    return this.plugin('formatter', name);
  }
  return fallback;
};

Context.one = new Context();

module.exports = Context;
