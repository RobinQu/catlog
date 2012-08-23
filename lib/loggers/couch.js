var util = require("util"),
    CoreLogger = require("./core"),
    nano = require("nano"),
    raw = require("../raw"),
    trace = require("../trace");

function CouchLogger(options) {
  CoreLogger.apply(this, arguments);
  options = options || {};
  this.couch = nano(options.url || "http://localhost:5984/");
  this.dbname = options.dbname || "catlog";
  this.db = this.couch.use(this.dbname);
}

util.inherits(CouchLogger, CoreLogger);

CouchLogger.prototype.info = function(event) {
  var doc, that;
  that = this;
  doc = {
    level: event.level,
    category: event.category,
    messages: event.messages,
    trace: trace(event.stack),
    timestamp: event.timestamp
  }
  this.db.insert(doc, function(e) {
    if(e) {
      if(e.message.indexOf("no_db_file") > -1) {
        that.couch.db.create(that.dbname, function(e) {
          if(e) {
            raw.error(e);
          } else {
            that.db.insert(doc);
          }
        });
      } else {
        raw.error(e);
      }
    }
  });
};

module.exports = CouchLogger;