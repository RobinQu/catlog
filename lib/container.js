var util = require("util"),
    EventEmitter = require("events").EventEmitter,
    slice = Array.prototype.slice,
    raw = require("./raw"),
    cycle = require("cycle");

function Container(options) {
  this.category = options.category || "";
  this.loggers = {};
  this.autoTrace = options.autoTrace || true;
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

Container.levels = ["warn", "debug", "log", "error"];

// Instance members
Container.prototype.info = function() {
  var level, messages;
  
  level = arguments[0] || "info";
  messages = slice.call(arguments, 1);
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


module.exports = Container;