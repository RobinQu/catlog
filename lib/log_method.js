var assert = require('assert');
var util = require('util');
var fmt = util.format.apply.bind(util.format, util);
var _ = require('lodash');

var ctx = require('./context');

module.exports = function (name, params, target) {
  assert(name, 'should have valid name');
  params = _.default(params || {}, {
    target: 'stdout',
    level: 100
  });
  // target.methods[name] = params;
  var func = params.method ? params.method(ctx) : function () {
    var text = fmt(arguments);
    if(params.target === 'filter') {
      //TODO filtered debug message
    } else {
      process[params.target].write(text + '\n');
    }
    ctx.emit(name, {
      category: params.category || this.category,
      text: text,
      tiemstamp: Date.now()
    });
  };
  if(target) {
    assert(!target[name], 'should not have naming conflict');
    target[name] = func;
  }
  return func;
};
