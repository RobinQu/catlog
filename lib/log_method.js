var assert = require('assert');
// var util = require('util');
var slice = Array.prototype.slice.call.bind(Array.prototype.slice);
var _ = require('lodash');
var raw = require('./raw');

module.exports = function (name, params, target) {
  var ctx = require('./context');

  assert(name, 'should have valid name');
  params = _.defaults(params || {}, {
    target: 'stdout',
    level: 100
  });
  var func = params.method ? params.method(ctx) : function () {
    var category = params.category || this.category || '';
    var args = slice(arguments, 0);
    var text = ctx.formatter(params.formatter).fmt(name, category, args);
    //print to stdout/stderr
    raw[params.target](text);
    ctx.emit(name, {
      category: category,
      text: text,
      tiemstamp: Date.now()
    });
  };
  if(target) {
    assert(!target[name], 'should not have naming conflict');
    target[name] = func;
  }
  //remember on itself
  func.category = params.category;
  func.name = name;
  func.target = params.target;
  func.level = params.level;
  return func;
};
