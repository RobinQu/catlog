var eyes = require("eyes"),
    colors = require('colors');

function Formatter(options) {
  options = options || {};
  this.coloring = options.coloring || true;
  this.colors = options.colors || {
    debug: "blue",
    log: "green",
    warn: "yellow",
    error: "red",
    category: "cyan",
    trace: "grey"
  }
  this.inspect = eyes.inspector({ stream: null });
}

Formatter.prototype.render = function(level, category, messages) {
  var str, i, len, m, levelStr, categoryStr;
  
  str = [];
  categoryStr = category === "default" ? "" : category.toUpperCase().underline.bold + ": ";
  levelStr = "[" + level.toUpperCase() + "]";
  if(this.coloring) {
    // categoryStr = categoryStr.underline.bold;
    levelStr = colors[this.colors[level]](levelStr).bold;
  }
  str.push(levelStr);
  str.push("\t");
  str.push(categoryStr);
  
  for(i=0,len=messages.length; i<len; i++) {
    m = messages[i];
    if("string" == typeof m) {
      str.push(m);
    } else {
      str.push(this.inspect(m));
    }
    str.push(" ");
  }
  return str.join("");
};



module.exports = Formatter;