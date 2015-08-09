var assert = require('assert');
// var util = require('util');
var slice = Array.prototype.slice.call.bind(Array.prototype.slice);
var _ = require('lodash');
var raw = require('./raw');

module.exports = function (name, params, target) {
  var ctx = require('./context');
  var hostname = require('os').hostname();

  assert(name, 'should have valid name');
  params = _.defaults(params || {}, {
    target: 'stdout',
    level: 100,
    topic: name
  });
  var func = function () {
    var category = params.category || this.category || '';
    var args = slice(arguments, 0);
    var text = ctx.formatter(params.formatter).fmt(name, category, args);
    //print to stdout/stderr
    raw[params.target](text);
    var event = {
      formatted: text,
      raw: args,
      datetime: new Date(),
      category: category,
      name: name,
      level: params.level,
      topic: params.topic,
      pid: process.pid,
      hostname: hostname
    };
    ctx.emit('log', params.event ? params.event(event) : event);
  };
  if(target) {
    assert(!target[name], 'should not have naming conflict');
    target[name] = func;
  }
  func.category = params.category;
  func.target = target;
  return func;
};
