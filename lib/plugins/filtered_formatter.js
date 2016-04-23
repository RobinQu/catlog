'use strict';

const raw = require('../raw');
const _ = require('lodash');
const pp = require('plugin-party');

/**
 * A formatter that suppports usages like visonmedia/debug. `DEBUG` env variable used to filter what the log method should output to stdout.
 *
 * @example
 // a.js
 * const debug = require('catlog')('foo:bar');
 * debug('hello, world');
 * // DEBUG=foo:bar node a.js
 *
 *
 * Without proper `DEBUG` env, all debug logs won't show. `DEBUG` env will be matched against the log topic, `foo:bar` in the example above.
 * Wildcard can be used to filter messages with a group of topics.
 *
 * @example
 * //b.js
 * const debug = require('catlog')('foo:cow');
 * //load a.js in the previous example
 * require('./a');
 * debug('i am in b.js');
 * //DEBUG=foo:* node b.js will output messages from both files
 *
 * @class FilteredFormatter
 * @extends Plugin
 */
//output by DEBUG rules
//if DEBUG env is not set, output nothing
const Filtered = pp.plugin({
  type: 'formatter',
  name: 'filtered',
  configure: function (options) {
    _.extend(this.options, options);
    this.template = _.template(this.options.template);
    this.colors = this.colors || {};
    this.names = [];
    this.skips = [];
    this.enable(process.env.DEBUG || options.namespaces);
    return this;
  }
}, {
  template: '  <%= category %> <%= text %>'
});

const proto = Filtered.prototype;

proto.enable = function (namespaces) {
  const split = (namespaces || '').split(/[\s,]+/);
  const len = split.length;

  for(let i = 0; i < len; i++) {
    if(!split[i]) {
      // ignore empty strings
      continue;
    }
    namespaces = split[i].replace(/\*/g, '.*?');
    if(namespaces[0] === '-') {
      this.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      this.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
};

proto.filter = function (name) {
  for(let i = 0, len = this.skips.length; i < len; i++) {
    if(this.skips[i].test(name)) {
      return false;
    }
  }
  for(let i = 0, len = this.names.length; i < len; i++) {
    if(this.names[i].test(name)) {
      return true;
    }
  }
  return false;
};

proto.fmt = function (level, params) {
  if(this.filter(params.category)) {
    return this.template({
      category: raw.renderWithRandomColor(params.category),
      text: params.raw
    });
  }
  return false;
};

module.exports = Filtered;
