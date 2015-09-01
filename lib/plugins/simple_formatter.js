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

proto.fmt = function (level, event/*, args*/) {
  var category = event.category;
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
    text: raw.stringify(event),
    pid: process.pid
  });
};

module.exports = Simple;
