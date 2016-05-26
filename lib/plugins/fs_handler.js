'use strict';

const pp = require('plugin-party');
const path = require('path');
const _ = require('lodash');
const dateFormat = require('dateformat');
// const raw = require('../raw');
const fs = require('fs');
const mkdirp = require('mkdirp');


/**
 * A handler that persists log data onto file system.
 * Default file name pattern is `topic.yyyy-mm-dd.log`, in which:
 *
 * * `topic` is topic property from invoking log method
 * * `yyyy-mm-dd` is formated string from current date
 *
 * Default template for formatting log lines is `[<%= datetime %>][<%= pid %>] <%= text %>\n`
 *
 * * `datetime` is in ISO datetime format
 * * `pid` is the process id
 * * `text` is the output of formatter of log method
 *
 * @class FSHandler
 * @extends Plugin
 */
const FSHandler = pp.plugin({
  type: 'handler',
  name: 'fs',
  configure: function (options, ctx) {
    _.extend(this.options, options);
    this.template = _.template(this.options.template);
    this.filenameTpl = _.template(this.options.filename);
    this.rotationFilenameTpl = _.template(this.options.rotationFilename);
    this.io = this.io || {};
    if(ctx) {
      this.bind(ctx);
    }
    return this;
  }
}, {
  requiredLevel: 80,
  dir: path.join(process.cwd(), 'logs'),
  extname: 'log',
  template: '[<%= datetime %>][<%= pid %>] <%= text %>\n',
  filename: '<%= topic %>.<%= extname %>',
  rotationFilename: '<%= topic %>.<%= datestr %>.<%= extname %>'
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
    throw new Error('given path is a folder: ' + fp);
  }
  mkdirp.sync(this.options.dir);
  //not usable file
  return fs.createWriteStream(fp);
};

proto.filepath = function (fileId) {
  const fp = path.join(this.options.dir, fileId);
  return fp;
};

proto.currentDate = function () {
  return new Date();
};

proto.handleLogEvent = function (event) {
  if(event.level < this.options.requiredLevel) {
    // skip unwanted events
    return;
  }
  const currentDate = this.currentDate();
  const eventDatestr = dateFormat(event.datetime, 'yyyy-mm-dd');
  const currentDatestr = dateFormat(currentDate, 'yyyy-mm-dd');
  const topic = event.topic;

  if(eventDatestr !== currentDatestr) {
    // fix incorrect datetime
    event.datetime = currentDate;
  }

  if(!this.io[topic]) {
    this.io[topic] = {
      mainId: this.rotationFilenameTpl({
        topic: topic,
        extname: this.options.extname,
        datestr: eventDatestr
      }),
      datestr: eventDatestr,
      rotation: []
    };
    const io = this.io[topic];
    const mainPath = this.filepath(io.mainId);
    io.mainPath = mainPath;
    if(fs.existsSync(mainPath)) {
      io.ctime = fs.statSync(mainPath).ctime;
    } else {
      io.ctime = currentDate;
    }
    io.stream = this.stream(io.mainId);
  }
  const io = this.io[topic];

  if(io.datestr !== currentDatestr) {
    const rotatedId = this.rotationFilenameTpl({
      topic: topic,
      extname: this.options.extname,
      datestr: currentDatestr
    });
    io.rotation.push(io.mainPath);
    io.mainPath = this.filepath(rotatedId);
    io.mainId = rotatedId;
    io.datestr = currentDatestr;
    io.stream.close();
    io.stream = this.stream(io.mainId);
  }
  const text = event.topic === event.category ? event.raw : [event.category, event.raw].join(' ');
  io.stream.write(this.template({
    text: text.trim(),
    datetime: event.datetime.toISOString(),
    pid: process.pid
  }));

};

proto.end = function () {
  _.forOwn(this.io, function (io) {
    if(io && io.close) {
      io.close();
    }
  });
};



module.exports = FSHandler;
