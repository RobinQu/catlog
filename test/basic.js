var CATLOG = require("../index");
// 
// var c = CATLOG.Container.get();
// 
// c.addLogger(CATLOG.loggers.Console);

CATLOG.setup();

// basic output
c.trace();

// printf is not enabled by default
c.log("nice %s", "printf");
c.log("nice log");
c.warn("nice warning");
c.debug("nice debug");
c.error("nice error");
c.log({a:1, b:"nice"}, "nice object")
c.error(new Error());
c.log("holy\n{{stack}}");
c.log(function() {})

// keywords
c.log("We are at {{current}}");

var basic = CATLOG.Container.get("basic");
basic.addLogger(CATLOG.loggers.Console);
basic.warn("basic is not simple");