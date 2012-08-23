var stacktrace = require("stack-trace");


function test() {
  var trace = stacktrace.get();
  console.log(trace[0].getFunction());
  console.log(trace[0].getFunction().arguments);
}

test(1, 2, {b:1});

