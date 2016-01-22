'use strict';

const pp = require('plugin-party');
const path = require('path');
const _ = require('lodash');
const dateFormat = require('dateformat');
// const raw = require('../raw');
const fs = require('fs');
const mkdirp = require('mkdirp');

const FSHandler = pp.plugin({
  type: 'handler',
  name: 'fs',
  configure: function (options, ctx) {
    _.extend(this.options, options);
    this.template = _.template(this.options.template);
    this.fileIds = this.fileIds || {};
    this.streams = this.streams || {};
    if(ctx) {
      this.bind(ctx);
    }
    return this;
  }
}, {
  requiredLevel: 80,
  dir: path.join(process.cwd(), 'logs'),
  extname: 'log',
  template: '[<%= datetime %>][<%= pid %>] <%= text %>\n'
});

const proto = FSHandler.prototype;

proto.bind = function (ctx) {
  if(!this._handler) {
    this._handler = this.handleLogEvent.bind(this);
    ctx.on('log', this._handler);
  }
  return this;
};

proto.stream = function (fileId) {
  const fp = path.join(this.options.dir, fileId);
  if(fs.existsSync(fp)) {
    const stat = fs.statSync(fp);
    if(stat.isFile()) {
      return fs.createWriteStream(fp, {flags: 'a'});
    }
  } else {
    mkdirp.sync(this.options.dir);
    //not usable file
    return fs.createWriteStream(fp);
  }
};

proto.handleLogEvent = function (event) {
  if(event.level < this.options.requiredLevel) {
    // skip unwanted events
    return;
  }

  const datestr = dateFormat(event.datetime, 'yyyy-mm-dd');
  const topic = event.topic;
  const fileId = [topic, datestr, this.options.extname].join('.');
  if(this.fileIds[topic] && this.fileIds[topic] !== fileId) {
    this.streams[this.fileIds[topic]].close();
    delete this.streams[this.fileIds[topic]];
    delete this.fileIds[topic];
  }
  let stream = this.streams[fileId];
  if(!stream) {
    stream = this.streams[fileId] = this.stream(fileId);
    this.fileIds[topic] = fileId;
  }
  stream.write(this.template({
    text: event.topic === event.category ? event.raw : [event.category, event.raw].join(' '),
    datetime: event.datetime.toISOString(),
    pid: process.pid
  }));
};


module.exports = FSHandler;
