var CATLOG = require("../index");

var c = CATLOG.Container.get();

c.addLogger(CATLOG.loggers.Console);
c.addLogger(CATLOG.loggers.CouchDB, {history:10 * 1000});

function test(str) {
  c.log("rock in the couchdb");
  c.warn(str);
}


i = 100;
while(i--) {
  test("this is a string");
}