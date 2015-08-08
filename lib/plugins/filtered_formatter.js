var raw = require('../raw');
var _ = require('lodash');
var colors = require('colors/safe');

var randomColor = function () {
  var names = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'gray', 'grey'];
  var name = names[Math.floor(Math.random() * names.length)];
  return name;
};

function Filtered() {
  this.template = _.template('\t<%= category %> <%= text %>');
  this.colors = {};
}

Filtered.pluginType = 'formatter';
Filtered.pluginName = 'filtered';

Filtered.create = function () {
  return new Filtered();
};

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
