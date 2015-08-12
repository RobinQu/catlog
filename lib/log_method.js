var assert = require('assert');
// var util = require('util');
var slice = Array.prototype.slice.call.bind(Array.prototype.slice);
var _ = require('lodash');
var raw = require('./raw');


module.exports = function (name, params, target) {
  var ctx = this;
  var hostname = require('os').hostname();

  assert(name, 'should have valid name');
  params = _.defaults(params || {}, {
    target: 'stdout',
    level: 100,
    //topic defaults to name(or level)
    topic: name
  });
  var func = function () {
    var category = params.category || this.category || '';
    var args = slice(arguments, 0);
    var event = {
      raw: raw.fmt(args),
      datetime: new Date(),
      category: category,
      name: name,
      level: params.level,
      topic: params.topic,
      pid: process.pid,
      hostname: hostname,
      target: params.target
    };
    var text = ctx.formatter(params.formatter).fmt(name, event, args);
    if(text) {//formatter may return falsy value to skip this line
      //print to stdout/stderr
      raw[params.target](text);
    }
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
