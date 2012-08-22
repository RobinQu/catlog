var util = require("util"),
    EventEmitter = require("events").EventEmitter,
    slice = Array.prototype.slice,
    raw = require("./raw"),
    cycle = require("cycle"),
    keywords = require("./keywords"),
    stackTrace = require("stack-trace"),
    dateformat = require("dateformat");

function Container(options) {
  this.category = options.category || "default";
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
  var level, messages;
  
  level = arguments[0] || "info";
  messages = this.preprocess(level, slice.call(arguments, 1) || []);
  if(level && messages.length) {//empty info is not recorded
    this.emit(level, this.category, cycle.decycle(messages));
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
  
  that = this;
  if("function" === typeof Logger) {//assume it's a logger class
    l = new Logger(options);
  } else {//assume it's a logger instance
    l = Logger;
  }
  if(l.name) {
    this.loggers[l.name] = l;
    Container.levels.forEach(function (level, i) {
      that.on(level, l[level].bind(l));
    });
  } else {
    raw.error("Missing name for logger")
  }
};

Container.prototype.preprocess = function(level, messages) {
  var trace = stackTrace.get(this.info).slice(1),
      current = trace[0],
      vars = {
        level: level,
        category: this.category,
        timestamp: dateformat(new Date(), "isoDateTime"),
        line: current.getLineNumber(),
        column: current.getColumnNumber(),
        path: current.getFileName(),
        method: current.getFunctionName() || "Object.<anonymous>",
        stack: trace,
        current: "{{method}} {{path}}:{{line}}:{{column}}",
        printStack: (new Error()).stack.split("\n").slice(4).join("\n")
      };
  // console.log(vars);
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