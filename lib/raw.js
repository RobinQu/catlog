var util = require('util');

module.exports = {

  //formatter
  fmt: util.format.apply.bind(util.format, util),

  //stdout
  stdout: function (text) {
    process.stdout.write(text + '\n');
  },

  stderr: function (text) {
    process.stderr.write(text + '\n');
  }
};
