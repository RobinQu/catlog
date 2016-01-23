'use strict';

const Redis = require('ioredis');
const pp = require('plugin-party');
const _ = require('lodash');

/**
 * A handler that relays log events to pubsub channel in redis.
 *
 * @class RedisHandler
 * @extends Plugin
 */
const RedisHandler = pp.plugin({
  type: 'handler',
  name: 'redis',
  configure: function (options, ctx) {
    this.options = _.extend(this.options, options || {});
    if(this.options.redis) {
      this.redis = this.options.redis instanceof Redis ? this.options.redis : new Redis(this.options.redis);
    } else {
      this.redis = new Redis();
    }
    this.channel = this.options.channel || this.getDefaultChannel();
    if(ctx) {
      this.bind(ctx);
    }
    return this;
  }
});

const proto = RedisHandler.prototype;

proto.bind = function (ctx) {
  if(!this._handler) {
    this._handler = this.handleLogEvent.bind(this);
    ctx.on('log', this._handler);
  }
  return this;
};

proto.handleLogEvent = function (event) {
  this.redis.publish(this.channel, JSON.stringify(event));
};

proto.getDefaultChannel = function () {
  const appName = process.title || process.env.APP_NAME || process.env.APP || 'unnamed';
  const env = process.env.NODE_ENV || 'development';
  return ['catlog', 'message', env, appName].join(':');
};


module.exports = RedisHandler;
