var util = require("util");

module.exports = {
  log: function(){
    process.stdout.write(util.format.apply(this, arguments) + "\n");
  },
  error: function(){
    process.stderr.write(util.format.apply(this, arguments) + "\n");
  }
};