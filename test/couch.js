var CATLOG = require("../index");

var c = CATLOG.Container.get();

c.addLogger(CATLOG.loggers.Console);
c.addLogger(CATLOG.loggers.CouchDB);

c.log("rock in the couchdb");