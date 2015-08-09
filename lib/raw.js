var util = require('util');
var tty = require('tty');

module.exports = {

  //formatter
  fmt: util.format.apply.bind(util.format, util),

  //stdout
  stdout: function (text) {
    process.stdout.write(text + '\n');
  },

  stderr: function (text) {
    process.stderr.write(text + '\n');
  },

  withColor: function (target) {
    if(process.env.DISABLE_COLOR && process.env.DISABLE_COLOR !== 'false') {
      return false;
    }
    if(target === 'stdout') {
      return tty.isatty(1);
    }
    if(target === 'stderr') {
      return tty.isatty(2);
    }
  }
};
