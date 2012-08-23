var CATLOG = require("../index");

var c = CATLOG.Container.get();

c.addLogger(CATLOG.loggers.Console);
c.addLogger(CATLOG.loggers.CouchDB);

function test(str) {
  c.log("rock in the couchdb");
  c.warn(str);
}


test("this is a string");

