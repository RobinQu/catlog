'use strict';

exports.methods = {
  trace: {
    target: 'stdout',
    level: 70
  },
  debug: {
    target: 'stdout',
    level: 80
  },
  info: {
    target: 'stdout',
    level: 100
  },
  warn: {
    target: 'stdout',
    level: 110
  },
  error: {
    target: 'stderr',
    level: 120
  }
};
