var catlog = require('..');
var Redis = require('ioredis');

catlog.configure(function () {
  this.install('handler', 'redis');
});
var logger = catlog();

var redis = new Redis();
redis.psubscribe('catlog:message:*', function () {
  console.log(arguments);
  logger.info('i am a superstar');

});
redis.on('pmessage', function () {
  console.log(arguments);
});
