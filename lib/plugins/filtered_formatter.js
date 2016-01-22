'use strict';

const raw = require('../raw');
const _ = require('lodash');
const pp = require('plugin-party');

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

  for(const i = 0; i < len; i++) {
    if (!split[i]) {
      // ignore empty strings
      continue;
    }
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
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
    if (this.names[i].test(name)) {
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
