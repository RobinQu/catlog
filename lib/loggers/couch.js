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
  this.docs = [];
}

util.inherits(CouchLogger, CoreLogger);


CouchLogger.prototype.clean = function() {
  var that, overflow, dels, len, i, doc, timer, release, func;
  
  func = arguments.callee;
  if(func.lock) return;
  func.lock = true;
  that = this;
  timer = setTimeout(function() {
    func.lock = false;
  }, 1000 * 30);
  release = function() {
    clearTimeout(timer);
    func.lock = false;
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


CouchLogger.prototype.bulkInsert = function() {
  var that, opt, func, timer, release;
  
  func = arguments.callee;
  if(func.lock) return;
  func.lock = true;
  timer = setTimeout(function() {
    func.lock = false;
  }, 10 * 1000);
  release = function() {
    clearTimeout(timer);
    func.lock = false;
  };
  that = this;
  opt = {docs: this.docs.splice(0)}
  this.db.bulk(opt, function(e) {
    release();
    if(e) {
      raw.error(e);
      that.docs = opt.docs.concat(that.docs);
    } else {
      that.clean();
    }
  });
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
    timestamp: event.timestamp,
    host: event.host,
    process: event.process
  }
  this.docs.push(doc);
  if(that.docs.length%10 === 0) that.bulkInsert();
};

module.exports = CouchLogger;