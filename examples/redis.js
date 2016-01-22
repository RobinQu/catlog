'use strict';

const catlog = require('..');
const Redis = require('ioredis');

const logger = catlog();
logger.configure(function (ctx) {
  ctx.install('handler', 'redis');
});

const redis = new Redis();
redis.psubscribe('catlog:message:*', function () {
  console.log(arguments);
  logger.info('i am a superstar');
});
redis.on('pmessage', function () {
  console.log(arguments);
});
