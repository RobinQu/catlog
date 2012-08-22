var util = require("util"),
    CoreLogger = require("./core"),
    nano = require("nano");


function CouchLogger(options) {
  CoreLogger.apply(this, arguments);
  this.couch = nano(options.url || "http://localhost:5984/");
  this.db = this.couch.use(options.db || "catlog");
}

util.inherits(CouchLogger, CoreLogger);

CouchLogger.prototype.info = function(level, container, messages) {
  
};


module.exports = CouchLogger;