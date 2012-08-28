var stacktrace = require("stack-trace"),
    trace = require("../lib/trace");


function test() {
  var stack = stacktrace.get();
  console.log(trace(stack)[0]);
  // console.log(trace[0].getFunction());
  // console.log(trace[0].getFunction().arguments);
}

test(1, 2, {b:1});



