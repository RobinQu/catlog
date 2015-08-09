var colors = require('colors/safe');
var _ = require('lodash');
var raw = require('../raw');
var pp = require('plugin-party');

var Simple = pp.plugin({
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

var proto = Simple.prototype;

proto.fmt = function (level, category, args) {
  return this.template({
    level: (colors[level] || colors.default)(level.toUpperCase()),
    category: colors.random(category),
    datetime: (new Date()).toISOString(),
    text: raw.fmt(args),
    pid: process.pid
  });
};

module.exports = Simple;
