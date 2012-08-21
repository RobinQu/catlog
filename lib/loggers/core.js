function CoreLogger(options) {
  
}

CoreLogger.levels = ["warn", "debug", "log", "error"];

CoreLogger.prototype.name = "core";

CoreLogger.prototype.info = function(level, category, messages) {
  /*
    TODO To be implemented
  */
};

CoreLogger.levels.forEach(function(level, i) {
  CoreLogger.prototype[level] = function(category, messages) {
    this.info(level, category, messages);
  };
});



module.exports = CoreLogger;