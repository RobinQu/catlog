var util = require("util"),
    CoreLogger = require("./core"),
    raw = require("../raw"),
    Formatter = require("../format");


function ConsoleLogger(options) {
  CoreLogger.apply(this, arguments);
  options = options || {};
  this.formatter = new Formatter(options.format || {});
}

util.inherits(ConsoleLogger, CoreLogger);

ConsoleLogger.prototype.name = "console";

ConsoleLogger.prototype.info = function(event) {
  var text;
  text = this.formatter.render(event.level, event.category, event.messages);
  if(event.level === "error") raw.error(text);
  else raw.log(text);
  
};

module.exports = ConsoleLogger;