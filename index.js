module.exports = {
  loggers: {
    Console: require("./lib/loggers/console"),
    CouchDB: require("./lib/loggers/couch"),
    Core: require("./lib/loggers/core")
  },
  Container: require("./lib/container"),
  setup: function(opt) {
    var C = require("./lib/container")
        c = C.get();
    c.addLogger(require("./lib/loggers/console"));
    if(!global._console) {
      var k,v;
      global._console = {};
      for(k in console) {
        if(console.hasOwnProperty(k)) global._console[k] = console[k];
      }
      C.levels.forEach(function(item) {
        console[item] = c[item].bind(c);
      });
    }
    return c;
  }
};