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
  // maximum docs number
  this.history = options.history || 3 * 24 * 60 * 60 * 1000;
  this.clean();
  this.cleaning = false;
  this.total = 0;
}

util.inherits(CouchLogger, CoreLogger);


CouchLogger.prototype.clean = function() {
  var that, overflow, dels, len, i, doc, timer, release;
  
  if(this.cleaning) return;
  that = this;
  this.cleaning = true;
  timer = setTimeout(function() {
    that.cleaning = false;
  }, 1000 * 30);
  release = function() {
    clearTimeout(timer);
    that.cleaning = false;
  };
  try {
    this.db.view("timeline","by_timestamp", {startkey:0,endkey:Date.now()-that.history}, function(e,body) {
      if(!e && body) {
        dels = [];
        for(i=0,len = body.rows.length; i<len; i++) {
          doc = body.rows[i];
          dels.push({_id:doc.id,_rev:doc.value,_deleted:true});
        }
        that.db.bulk({docs:dels}, release);
      } else {
        release();
      }
    });    
  } catch(e) {}
};


CouchLogger.prototype.info = function(event) {
  var doc, that;
  that = this;
  doc = {
    level: event.level,
    category: event.category,
    messages: event.messages,
    //only store the top level CallSite
    trace: trace(event.stack)[0],
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
    } else {
      that.total++;
      // try to clean the db every 10 insertions
      if(that.total%10 === 0) that.clean();
    }    
  });
};

module.exports = CouchLogger;