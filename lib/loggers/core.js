var Container = require("../container");

function CoreLogger(options) {
  this.raw = require("../raw");
}

CoreLogger.prototype.name = "core";

CoreLogger.prototype.record = function(level, category, messages) {
  /*
    TODO To be implemented
  */
};

Container.levels.forEach(function(level, i) {
  CoreLogger.prototype[level] = function() {
    this.record.apply(this, arguments);
  };
});


module.exports = CoreLogger;