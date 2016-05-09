'use strict';

const sinon = require('sinon');
const expect = require('chai').expect;
const fs = require('fs');
const moment = require('moment');

describe('FS handler', function () {

  const FH = require('../lib/plugins/fs_handler');

  it('should rotate by date', function (done) {
    const fh = new FH({
      dir: '/tmp/test',
      template: '<%= text %>'
    });
    const dates = [
      moment().subtract(2, 'days').toDate(),
      moment().subtract(1, 'days').toDate(),
      new Date()
    ];
    sinon.stub(fh, 'currentDate');
    fh.currentDate.onCall(0).returns(dates[0]);
    fh.currentDate.onCall(1).returns(dates[1]);
    fh.currentDate.onCall(2).returns(dates[2]);
    const topic = `topic_${Date.now()}`;
    const events = [{
      target: 'stdout',
      raw: 'test1',
      topic: topic,
      category: topic,
      datetime: dates[0]
    }, {
      target: 'stdout',
      raw: 'test2',
      topic: topic,
      category: topic,
      datetime: dates[1]
    }, {
      target: 'stdout',
      raw: 'test3',
      topic: topic,
      category: topic,
      datetime: dates[2]
    }];

    fh.handleLogEvent(events[0]);
    const io = fh.io[topic];
    const main = io.mainPath;
    expect(fs.existsSync(main)).to.be.true;

    fh.handleLogEvent(events[1]);
    expect(io.rotation.length).to.equal(1);

    fh.handleLogEvent(events[2]);
    expect(io.rotation.length).to.equal(2);


    fh.end();
    // delay for write
    setImmediate(function () {

      try {
        expect(fs.readFileSync(main, 'utf8')).to.equal(events[2].raw);
        expect(fs.readFileSync(io.rotation[0], 'utf8')).to.equal(events[0].raw);
        expect(fs.readFileSync(io.rotation[1], 'utf8')).to.equal(events[1].raw);
        done();
      } catch (e) {
        done(e);
      }
    });

  });

  it('should backup', function (done) {
    const dates = [
      new Date(),
      moment().add(1, 'days')
    ];
    const topic = `backup_${Date.now()}`;
    const events = [{
      target: 'stdout',
      raw: 'test1',
      topic: topic,
      category: topic,
      datetime: dates[0]
    }, {
      target: 'stdout',
      raw: 'test2',
      topic: topic,
      category: topic,
      datetime: dates[1]
    }];


    // write for today
    const fh = new FH({
      dir: '/tmp/test',
      template: '<%= text %>'
    });
    sinon.stub(fh, 'currentDate');
    fh.currentDate.returns(dates[0]);
    fh.handleLogEvent(events[0]);
    fh.end();

    // write for tomorrow
    const fh2 = new FH({
      dir: '/tmp/test',
      template: '<%= text %>'
    });
    sinon.stub(fh2, 'currentDate');
    fh2.currentDate.returns(dates[1]);
    fh2.handleLogEvent(events[1]);

    fh2.end();

    const io2 = fh2.io[topic];

    setImmediate(function () {
      try {
        expect(fs.readFileSync(io2.mainPath, 'utf8')).to.equal(events[1].raw);
        expect(fs.readFileSync(io2.rotation[0], 'utf8')).to.equal(events[0].raw);
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('should write concurrently', function (done) {
    const topic = `concurrency_${Date.now()}`;
    const events = [{
      target: 'stdout',
      raw: 'test1',
      topic: topic,
      category: topic,
      datetime: new Date()
    }, {
      target: 'stdout',
      raw: 'test2',
      topic: topic,
      category: topic,
      datetime: new Date()
    }];
    const fh = new FH({
      dir: '/tmp/test'
    });
    const fh2 = new FH({
      dir: '/tmp/test'
    });
    fh.handleLogEvent(events[0]);
    fh2.handleLogEvent(events[1]);

    const io = fh.io[topic];
    fh.end();
    fh2.end();

    setImmediate(function () {
      try {
        const str = fs.readFileSync(io.mainPath, 'utf8');
        expect(str).to.include(events[0].raw);
        expect(str).to.include(events[1].raw);
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('should rotate to another location', function (done) {
    const fh = new FH({
      dir: '/tmp/test',
      template: 'fh1: <%= text %>'
    });
    const fh2 = new FH({
      dir: '/tmp/test',
      template: 'fh2: <%= text %>'
    });
    const dates = [
      new Date(),
      moment().add(1, 'days').toDate(),
      moment().add(2, 'days').toDate()
    ];
    sinon.stub(fh, 'currentDate');
    fh.currentDate.onCall(0).returns(dates[0]);
    fh.currentDate.onCall(1).returns(dates[1]);

    sinon.stub(fh2, 'currentDate');
    fh2.currentDate.onCall(0).returns(dates[0]);
    fh2.currentDate.onCall(1).returns(dates[1]);


    const topic = `dup_${Date.now()}`;
    const events = [{
      target: 'stdout',
      raw: 'test1',
      topic: topic,
      category: topic,
      datetime: dates[0]
    }, {
      target: 'stdout',
      raw: 'test2',
      topic: topic,
      category: topic,
      datetime: dates[1]
    }, {
      target: 'stdout',
      raw: 'test3',
      topic: topic,
      category: topic,
      datetime: dates[2]
    }];


    fh.handleLogEvent(events[0]);
    fh2.handleLogEvent(events[0]);

    // fs.stat will always return ctime of today, all the following events would happen in 'tomorrow'
    fh.handleLogEvent(events[1]);

    setImmediate(function () {
      fh2.handleLogEvent(events[1]);
      const io = fh.io[topic];
      const io2 = fh.io[topic];
      setImmediate(function () {
        try {
          expect(io.rotation.length).to.equal(1);
          expect(io2.rotation.length).to.equal(1);
          expect(io2.rotation[0]).not.to.equal(io2.rotation[1]);
          // expect(fs.readFileSync(io.rotation[0], 'utf8')).to.include(events[0].raw);
          // expect(fs.readFileSync(io.rotation[0], 'utf8')).to.equal(events[0].raw);
          done();
        } catch (e) {
          done(e);
        }
      });
    });



  });

});
