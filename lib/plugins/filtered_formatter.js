var raw = require('../raw');
var _ = require('lodash');
var pp = require('plugin-party');


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

proto.fmt = function (level, params, args) {
  return this.template({
    category: raw.renderWithRandomColor(params.category),
    text: params.raw
  });
};

module.exports = Filtered;
