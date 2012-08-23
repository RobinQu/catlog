var util = require("util");

// Custom logger should be a descendent of CoreLogger
CATLOG = require("../index");
var CoreLogger = CATLOG.loggers.Core;

// options is passed by CATLOG.Container.get()
function MyLogger(options) {
  CoreLogger.apply(this, arguments);
}

util.inherits(MyLogger, CoreLogger);

// Technically speaking, `info` method is the only thing you need to implement. All other log levels will call this method internally.
MyLogger.prototype.info = function(event) {
  // event.level: logging level
  // event.category: event category
  // event.messages: messages in array
  // event.timestamp: unix timestamp
  // event.stack: v8 CallSite Objects in array

  // this.raw.log will output to stdout
  if(event.level === "error") {
    this.raw.error(event.level, event.timestamp, event.category, event.messages.join(" "), event.stack.join("\n"));
  } else {
    this.raw.log(event.level, event.timestamp, event.messages.join(" "), event.category);
  }
};


var mylogger = CATLOG.Container.get("myapp");
mylogger.addLogger(MyLogger);

mylogger.log("good!");
mylogger.error("damm it!");