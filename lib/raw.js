'use strict';

const util = require('util');
const tty = require('tty');
const os = require('os');

const colorCache = {};
const colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'gray', 'grey'];

const pid = process.pid;
const hostname = os.hostname();

const raw = module.exports = {

  //formatter
  fmt: util.format.apply.bind(util.format, util),

  stringify: function (args, params) {
    if(args.length === 1 && args[0] instanceof Error && params.stack) {
      // print stack
      const e = args[0];
      return [
        e.stack,
        'pid: ' + pid,
        'Host: ' + hostname,
        'URL: ' + (e.url || ''),
        'Date: ' + (new Date()).toISOString()
      ].join(os.EOL);
    }
    return raw.fmt(args);
  },

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
    return false;
  },

  randomColor: function (name) {
    let color;
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
