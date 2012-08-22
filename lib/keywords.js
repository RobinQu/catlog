function render(text, variables) {
  return text.replace(/\{\{(.+?)\}\}/g, function(match, key) {
    // console.log(match, key, variables[key]);
    var v;
    v = variables[key];
    return typeof v === "undefined" ? match : v;
  });
}

module.exports = function keywords(text, variables) {
  var k, v;
  for(k in variables) {
    v = variables[k];
    if(variables.hasOwnProperty(k) && "string" === typeof v) {
      variables[k] = render(v, variables);
    }
  }
  return render(text, variables);
}