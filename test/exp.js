var context = require('catlog')({//global config
  name: 'tms-web'
});
//global setup
context.addHander('fs', {
  dir: './logs'
});

//
var logger = require('catlog')('app:main');

logger.debug('xx');
