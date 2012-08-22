CATLOG
======
Yet another logging utility for nodejs

WHY?
----
We already have `winston`, `log4js`, `log.js`, etc. Why bother to make another logger? After reading docs and source code for 2 hours, I didn't manage to setup my logger based on any projects mentioned before. I think it's of anti-humanism to force most people to learn all the options and setup the tools for very common purpose. Who cares what color should be used in different logging themes?!

WHAT?
-----
By default:

    require("catlog").setup();

* It provodes four logging level: `log`, `warn`, `error` and `debug`
* It will replace `console` object and will output log to  `stdout` and `stderr` with text colored.
* It's able to cram multiple objects into a single logging call, like `logger.log(a,b,c,)`
* It tries to print objects in pretty format and will prevent cycling references

HOW?
----

* To categorize logs. A category is called a `Container`. To create a log category, you should create your own `Container` and assign at least one `logger` to it.
    
        var catlog = require("catlog");
        var Garfield = catlog.Container.get("garfield");
        //a logger that outputs to console
        Garfield.addLogger(catlog.loggers.Console);
        //Garfield will handle various levels of logs
        Garfield.log("nice day");

* To transport log to somewhere else
      
      <!--
        TODO 
      -->



