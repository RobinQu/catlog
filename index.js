module.exports = {
  loggers: {
    Console: require("./lib/loggers/console"),
    CouchDB: require("./lib/loggers/couch")
  },
  Container: require("./lib/container"),
  setup: function(opt) {
    
  }
};