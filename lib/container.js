var util = require("util"),
    EventEmitter = require("events").EventEmitter,
    slice = Array.prototype.slice,
    raw = require("./raw"),
    cycle = require("cycle"),
    keywords = require("./keywords"),
    stackTrace = require("stack-trace"),
    dateformat = require("dateformat"),
    os = require("os");

function Container(options) {
  options = options || {};
  this.category = options.category || "default";
  this.printf = options.printf || false;
  this.loggers = {};
  EventEmitter.call(this);
}

util.inherits(Container, EventEmitter)


// Static
Container.get = function(category, options) {
  if("string" === typeof category) {
    options = options || {};
    options.category = category;
  } else {
    options = category || {};
  }  
  return new Container(options);
};

Container.levels = ["trace", "debug", "log", "warn", "error"];

// Instance members
Container.prototype.info = function() {
  var level, messages, stack;
  
  level = arguments[0] || "info";
  stack = stackTrace.get(this.info).slice(1);
  messages = this.preprocess(level, slice.call(arguments, 1) || [], stack);
  if(this.printf) messages = [util.format.apply(util, messages)];
  if(level && messages.length) {//empty info is not recorded
    this.emit(level, {
      timestamp: Date.now(),
      level: level,
      category: this.category, 
      messages: cycle.decycle(messages), 
      stack: stack,
      process: process.title,
      host: os.hostname()
    });
  }
};

Container.levels.forEach(function (item, i) {
  Container.prototype[item] = function() {
    var args;
    
    args = slice.call(arguments, 0);
    args.unshift(item);
    this.info.apply(this, args); 
  };  
});

Container.prototype.addLogger = function(Logger, options) {
  var that;
  options = options || {};
  that = this;
  if("function" === typeof Logger) {//assume it's a logger class
    l = new Logger(options);
  } else {//assume it's a logger instance
    l = Logger;
  }  
  if(l.name) {
    this.loggers[l.name] = l;
    // notify = function(event) {
    //   l[event.level].call(l, event);
    // };
    Container.levels.forEach(function (level, i) {
      that.on(level, l[level].bind(l));
    });
  } else {
    raw.error("Missing name for logger")
  }
};

Container.prototype.preprocess = function(level, messages, stack) {
  var current = stack[0],
      vars = {
        level: level,
        reciever: current.getTypeName(),
        category: this.category,
        timestamp: dateformat(new Date(), "isoDateTime"),
        line: current.getLineNumber(),
        column: current.getColumnNumber(),
        file: current.getFileName(),
        func: current.getFunctionName() || "Object.<anonymous>",
        current: "{{func}} {{file}}:{{line}}:{{column}}",
        stack: (new Error()).stack.split("\n").slice(4).join("\n")
      };
  if(level === "trace") messages.unshift("{{timestamp}} - {{current}}");
  return messages.map(function(item, i) {
    var ret, trace;
    ret = item;
    if(typeof item === "string") {
      ret = keywords(item, vars);
    } else if(item instanceof Error) {
      ret = (i === 0) ? "" : "\n" ;
      ret += item.stack
    }
    return ret;
  });
};


module.exports = Container;