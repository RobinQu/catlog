var Container = require("../container");

function CoreLogger(options) {
  
}

CoreLogger.prototype.name = "core";

CoreLogger.prototype.info = function(level, category, messages) {
  /*
    TODO To be implemented
  */
};

Container.levels.forEach(function(level, i) {
  CoreLogger.prototype[level] = function() {
    this.info.apply(this, arguments);
  };
});


module.exports = CoreLogger;