'use strict';

const colors = require('colors/safe');
const _ = require('lodash');
const raw = require('../raw');
const pp = require('plugin-party');

const Simple = pp.plugin({
  name: 'simple',
  type: 'formatter',
  configure: function (options) {
    this.options = _.extend(this.options, options);
    colors.setTheme(this.options.theme);
    this.template = _.template(this.options.template);
    return this;
  }
}, {
  template: '[<%= level %>][<%= pid %>][<%= datetime %>] <%= category %><%= text %>',
  theme: {
    debug: 'gray',
    info: 'green',
    warn: 'yellow',
    error: 'red',
    'default': 'green'
  }
});

const proto = Simple.prototype;

proto.fmt = function (level, event) {
  let category = event.category;
  if(raw.withColor(event.target)) {
    level = (colors[level] || colors.default)(level.toUpperCase());
    category = raw.renderWithRandomColor(event.category);
  } else {
    level = level.toUpperCase();
  }
  return this.template({
    level: level,
    category: category,
    datetime: event.datetime.toISOString(),
    text: event.raw,
    pid: process.pid
  });
};

module.exports = Simple;
