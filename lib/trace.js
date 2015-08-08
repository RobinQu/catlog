var cycle = require('cycle');

function extract(call, i) {
  var callInfo = {}, slice;
  if(call) {
    slice = Array.prototype.slice;
    callInfo = {
      reciever: call.getTypeName(),
      func: call.getFunctionName() || '<anonymous>',
      file: call.getFileName(),
      line: call.getLineNumber(),
      column: call.getColumnNumber(),
      evalOrigin: call.getEvalOrigin(),
      isTopLevel: call.isToplevel(),
      isEval: call.isEval(),
      isNative: call.isNative(),
      isConstructor: call.isConstructor()
    };
    if(i === 0) {//only record arguments for deepest call
      callInfo.args = cycle.decycle(slice.call(call.getFunction().arguments, 0)) || [];
    }
  }
  return callInfo;
}

module.exports = function trace(stack) {
  // extract info from CallSite ojbects
  if(stack) {
    return stack.map(extract);
  }
};
