CATLOG
======
Logging utility for nodejs without pain

INSTALL
-------

	npm install catlog

WHY?
----
We already have `winston`, `log4js`, `log.js`, etc. Why bother to make another logger? After reading docs and source code for 2 hours, I didn't manage to setup my logger based on any projects mentioned before. I think it's of anti-humanism to force most people to learn all the options and setup the tools for very common purpose. Who cares what color should be used in different logging themes?!

WHAT?
-----
Minimum setup that meets the demands of majorities by default:

    require("catlog").setup();

* It provodes four logging level: `trace`, `log`, `warn`, `error` and `debug`
* It will print out timestamp and current call info even if you do nothing but `console.trace()`
* It will replace `console` object and will output log to  `stdout` and `stderr` with text colored.
* It's able to cram multiple objects into a single logging call, like `console.log(a,b,c,d)`
* It tries to print objects in pretty format and will prevent cycling references
* It support keyword replacements in log content, e.g. 
 
		"log level: {{level}}"
		//will change to "log level: warn" if you are writing a warning log
	 
	Keywords including:
	* level: logging level
	* category: logging category
	* timestamp: ISO date string, like "2012-08-23T15:26:01"
	* reciever: `this` object type of current context
	* line: line number of current call
	* culumn: column number of current call
	* file: file name where current call is invoked
	* func: function name of current call
	* current: current call info
	* stack: stack info in string

HOW?
----
* To satisfy the demands of minorities like you, please go on reading
* To configure minimum setup
		
		//default settings
		require("catlog").setup(replaceConsole=true, {
			printf: false, //enable printf-like replacemnet?
			coloring: true //color the texts in console?
			colors: {
			    debug: "blue",
			    log: "green",
			    warn: "yellow",
			    error: "red",
			    category: "cyan",
			    trace: "grey"
			}
		});	
* To categorize logs. A category is called a `Container`. To create a log category, you should create your own `Container` and assign at least one `logger` to it.
    
        var catlog = require("catlog");
        var Garfield = catlog.Container.get("garfield");
        //a logger that outputs to console
        Garfield.addLogger(catlog.loggers.Console);
        //Garfield will handle various levels of logs
        Garfield.log("nice day");

* To transport log to somewhere else. Implement your own logger and create your own container with it.

		var c = catlog.Container.get("mycategory");
		c.addLogger(MyFancyLogger);
		c.log("nothing will happen");
		
* To implement your own logger:
		
		var util = require("util");
		
		//Do not run `catlog.setup` method
		var catlog = require("catlog");
		// Custom logger should be a descendent of CoreLogger
		var CoreLogger = catlog.loggers.Core;
		
		// options is passed by CATLOG.Container.get()
		function MyLogger(options) {
		  CoreLogger.apply(this, arguments);
		  this.prefix = options.prefix || "";
		}
		
		util.inherits(MyLogger, CoreLogger);
		
		// Technically speaking, `info` method is the only thing you need to implement. All other log levels will call this method internally.
		MyLogger.prototype.info = function(event) {
		  // event.level: logging level
		  // event.category: event category
		  // event.messages: messages in array
		  // event.timestamp: unix timestamp
		  // event.stack: v8 CallSite Objects in array
		
		  // this.raw.log will output to stdout
		  if(event.level === "error") {
		    this.raw.error(this.prefix, event.level, event.timestamp, event.category, event.messages.join(" "), event.stack.join("\n"));
		  } else {
		    this.raw.log(this.prefix, event.level, event.timestamp, event.messages.join(" "), event.category);
		  }
		};
		
		//Use it as normal. You call optionally pass something your logger
		var mylogger = catlog.Container.get("myapp", {prefix:"rock!"});
		mylogger.addLogger(MyLogger);
		
		mylogger.log("good!");
		mylogger.error("damm it!");
* To store logs with CouchDB. catlog ships with a couchdb logger:

		var cat = require("catlog");
		var c = catlog.Container.get();
		
		c.addLogger(catlog.loggers.Console);
		c.addLogger(catlog.loggers.CouchDB, {
			url: "http://localhost:5984",
			dbname: "catlog"
		});
		c.log("rock in the couchdb");


Contribute
----------
Pull requests are welcomed. Submit your own loggers or bug fixs, please!
