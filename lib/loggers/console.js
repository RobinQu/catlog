var util = require("util"),
    CoreLogger = require("./core"),
    raw = require("../raw"),
    Formatter = require("../format");


function ConsoleLogger(options) {
  options = options || {};
  CoreLogger.apply(this, arguments);
  this.formatter = new Formatter(options.format || {});
}

util.inherits(ConsoleLogger, CoreLogger);

ConsoleLogger.prototype.name = "console";

ConsoleLogger.prototype.info = function(level, category, messages) {
  raw.log(this.formatter.render(level, category, messages));
};

module.exports = ConsoleLogger;