var pp = require('plugin-party');
var path = require('path');
var _ = require('lodash');
var dateFormat = require('dateformat');
// var raw = require('../raw');
var fs = require('fs');
var mkdirp = require('mkdirp');

var FSHandler = pp.plugin({
  type: 'handler',
  name: 'fs',
  configure: function (options, ctx) {
    _.extend(this.options, options);
    this.template = _.template(this.options.template);
    this.fileIds = this.fileIds || {};
    this.streams = this.streams || {};
    mkdirp.sync(this.options.dir);
    if(ctx) {
      this.bind(ctx);
    }
    return this;
  }
}, {
  dir: path.join(process.cwd(), 'logs'),
  extname: 'log',
  template: '[<%= datetime %>][<%= pid %>] <%= text %>\n'
});

var proto = FSHandler.prototype;

proto.bind = function (ctx) {
  if(!this._handler) {
    this._handler = this.handleLogEvent.bind(this);
    ctx.on('log', this._handler);
  }
  return this;
};

proto.stream = function (fileId) {
  var fp = path.join(this.options.dir, fileId);
  if(fs.existsSync(fp)) {
    var stat = fs.statSync(fp);
    if(stat.isFile()) {
      return fs.createWriteStream(fp, {flags: 'a'});
    }
  } else {//not usable file
    return fs.createWriteStream(fp);
  }
};

proto.handleLogEvent = function (event) {
  var datestr = dateFormat(event.datetime, 'yyyy-mm-dd');
  var topic = event.topic;
  var fileId = [topic, datestr, this.options.extname].join('.');
  if(this.fileIds[topic] && this.fileIds[topic] !== fileId) {
    this.streams[this.fileIds[topic]].close();
    delete this.streams[this.fileIds[topic]];
    delete this.fileIds[topic];
  }
  var stream = this.streams[fileId];
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
