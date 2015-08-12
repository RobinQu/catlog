var catlog = require('..');
var Redis = require('ioredis');

var logger = catlog();
logger.configure(function (ctx) {
  ctx.install('handler', 'redis');
});

var redis = new Redis();
redis.psubscribe('catlog:message:*', function () {
  console.log(arguments);
  logger.info('i am a superstar');
});
redis.on('pmessage', function () {
  console.log(arguments);
});
