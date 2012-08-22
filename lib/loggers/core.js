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
  CoreLogger.prototype[level] = function(category, messages) {
    this.info(level, category, messages);
  };
});



module.exports = CoreLogger;