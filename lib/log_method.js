'use strict';

const assert = require('assert');
const slice = Array.prototype.slice.call.bind(Array.prototype.slice);
const _ = require('lodash');
const raw = require('./raw');


module.exports = function (name, params, target) {
  const self = this;
  const hostname = require('os').hostname();

  assert(name, 'should have valid name');
  params = _.defaults(params || {}, {
    target: 'stdout',
    level: 100,
    //topic defaults to name(or level)
    topic: name,
    stack: true,
    trace: false
  });
  const func = function () {
    const category = params.category || this.category || '';
    const args = slice(arguments, 0);
    const event = {
      raw: raw.stringify(args, params),
      datetime: new Date(),
      category: category,
      name: name,
      level: params.level,
      topic: params.topic,
      pid: process.pid,
      hostname: hostname,
      target: params.target
    };
    const text = self.formatter(params.formatter).fmt(name, event, args);
    //formatter may return falsy value to skip this line
    if(text) {
      //print to stdout/stderr
      raw[params.target](text);
    }
    self.emit('log', params.event ? params.event(event) : event);
  };
  if(target) {
    assert(!target[name], 'should not have naming conflict');
    target[name] = func;
  }
  func.category = params.category;
  func.target = target;
  return func;
};
