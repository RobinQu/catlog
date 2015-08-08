var colors = require('colors/safe');
var _ = require('lodash');
var raw = require('../raw');

// simple coloring
function Simple() {
  this.options = {};
  this.configure({
    template: '[<%= level %>][<%= datetime %>] <%= category %><%= text %>',
    theme: {
      debug: 'gray',
      info: 'green',
      warn: 'yellow',
      error: 'red',
      'default': 'green'
    }
  });
}

var proto = Simple.prototype;

proto.configure = function (options) {
  this.options = _.extend(this.options, options);
  colors.setTheme(this.options.theme);
  this.template = _.template(this.options.template);
};

proto.fmt = function (level, category, args) {
  return this.template({
    level: (colors[level] || colors.default)(level.toUpperCase()),
    category: colors.random(category),
    datetime: (new Date()).toISOString(),
    text: raw.fmt(args)
  });
};


Simple.pluginType = 'formatter';
Simple.pluginName = 'simple';

Simple.create = function () {
  return new Simple();
};


module.exports = Simple;
