var raw = require('../raw');
var _ = require('lodash');
var colors = require('colors/safe');
var pp = require('plugin-party');

var randomColor = function () {
  var names = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'gray', 'grey'];
  var name = names[Math.floor(Math.random() * names.length)];
  return name;
};

var Filtered = pp.plugin({
  type: 'formatter',
  name: 'filtered',
  configure: function (options) {
    _.extend(this.options, options);
    this.template = _.template(this.options.template);
    this.colors = this.colors || {};
    return this;
  }
}, {
  template: '\t<%= category %> <%= text %>'
});

var proto = Filtered.prototype;

proto.fmt = function (level, category, args) {
  var color = this.colorForCategory(category);
  return this.template({
    category: colors[color](category),
    text: raw.fmt(args)
  });
};

proto.colorForCategory = function (category) {
  var color = this.colors[category];
  if(!color) {
    color = this.colors[category] = randomColor();
  }
  return color;
};

module.exports = Filtered;
