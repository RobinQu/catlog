var util = require('util');
var tty = require('tty');

var colorCache = {};
var colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'gray', 'grey'];

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
  },

  randomColor: function (name) {
    var color;
    if(name) {
      color = colorCache[name];
      if(!color) {
        color = colorCache[name] = this.randomColor();
      }
    } else {
      color = colors[Math.floor(Math.random() * colors.length)];
    }
    return color;
  },

  renderWithRandomColor: function (name) {
    return require('colors')[this.randomColor(name)](name);
  }
};
