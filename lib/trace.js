var cycle = require("cycle");

function extract(call) {
  if(call) return {
    reciever: call.getTypeName(),
    func: call.getFunctionName() || "<anonymous>",
    args: cycle.decycle(call.getFunction().argumnets),
    file: call.getFileName(),
    line: call.getLineNumber(),
    column: call.getColumnNumber(),
    evalOrigin: call.getEvalOrigin(),
    isTopLevel: call.isToplevel(),
    isEval: call.isEval(),
    isNative: call.isNative(),
    isConstructor: call.isConstructor()
  };
  
}

module.exports = function trace(stack) {
  // extract info from CallSite ojbects
  if(stack) return stack.map(extract);
};
