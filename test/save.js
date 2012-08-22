var nano = require("nano")("http://localhost:5984/logs");


nano.insert({test:"hello"});
