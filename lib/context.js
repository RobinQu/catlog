'use strict';

const _ = require('lodash');
const EE = require('eventemitter3');
const pp = require('plugin-party');
const path = require('path');
const fs = require('fs');

/**
 * Plugin is used to offer more possiblities with catlog.
 *
 * @class Plugin
 */


 /**
  * A method to apply options for plugin
  *
  * @memberof Plugin#
  * @param {Object} options - passed options
  * @returns {void}
  */

/**
 * Plugin type name
 *
 * @type {string}
 * @memberof Plugin#
 */

/**
 * Plugin name
 *
 * @type {string}
 * @memberof Plugin#
 */

/**
 * @typedef {Object} ContextOptions
 * @property {PluginOptions[]} - options for plugins. Except `name` and `type`, other properties may be required for many plugins.
 */

/**
 * @typedef {Object} PluginOptions
 * @property {!string} type - plugin type name, that is `formatter` or `handler`
 * @property {!string} name - unique plugin name
 *
 */

/**
 * @typedef {Object} LoggerOptions
 * @property {!string} name - method name on logger
 * @property {number} [level=100] - a positive integer that represents its priority.
 * @property {string} topic - a human-readable label. Copied from `name` if not given
 * @property {boolean} [stack=true] - if this method should capture the calling stack
 * @property {boolean} [trace=false] - if this method should output stack trace
 */

//fallback formatter
const fallback = {
  fmt: function () {
    return false;
  },
  configure: function () {}
};

/**
 * Working context, which stores all plugins and configrations, can generate multiple loggers.
 * A context has two types of plugins:
 *
 * 1. Handler: a handler recieve log info and process. For example, a {@link FSHandler} can persists log data onto file system with rolling datetime as fileanme. A log method passes log data to handlers through event emitter asynchronously, so that a compliated handler won't affect performance.
 * 2. Formatter: a formatter is used to render log text with raw log data. Most simple formatter is {@link NativeFormatter}, which only output with `util.format` shipped by Node.js.
 *
 * By default, a context is equipped with a {@link SimpleFormatter} and {@link FSHandler}.
 *
 * @class
 */
class Context extends EE {

  /**
   * Default constructor
   *
   * @param {ContextOptions} [options] - contxt options
   * @constructor
   */
  constructor(options) {
    super();
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

    this.addLogMethod = require('./log_method');
  }

  /**
   * Update context with options.
   *
   * @param {ContextOptions} options - contxt options
   * @returns {Context} - current context
   */
  configure(options) {
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
  }

  /**
   * Create a logger with options. A logger can have abitary log methods. By defualt, a logger only has `info`, `debug`, `info`, `warn`, `error` methods.
   * Each method has its own attributes specified by {@link LoggerOptions}
   *
   *
   * @param {LoggerOptions} [options] - options for a logger
   * @returns {Logger} - created logger
   */
  logger(options) {
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
  }

  /**
   * Setup a plugin
   *
   * @param {string} type - plugin type
   * @param {string} name - plugin name
   * @param {PluginOptions} options - plugin options
   * @returns {Context} - context it self
   */
  install(type, name, options) {
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
  }

  /**
   * Get a registerd formatter by name. If not formatter has been defined before, a fallback formatter will be returned, which output nothing to stdout/stderr.
   *
   * @param {string} name - formatter name
   * @returns {Formatter} - the formatter found
   */
  formatter(name) {
    name = name || this.formatters[0];
    if(name) {
      return this.plugin('formatter', name);
    }
    return fallback;
  }

  /**
   * Default method configs. See {@link defaults.js} for detailed config.
   * @type {Object}
   */
  static get defaults() {
    return require('./defaults');
  }

  /**
   * Shared instance with default configuration
   * @type {Context}
   *
   */
  static get one() {
    return new Context();
  }
}

module.exports = Context;
