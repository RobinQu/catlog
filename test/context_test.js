'use strict';

const Context = require('../').Context;
const fs = require('fs');
const expect = require('chai').expect;

describe('Context', function () {

  it('should create with options', function (done) {
    const ctx = new Context({
      plugins: [
        {type: 'handler', name: 'fs', dir: '/tmp/test'}
      ]
    });
    const logger = ctx.logger();
    logger.info('test');
    expect(fs.existsSync('/tmp/test')).to.be.true;
    expect(ctx.handlers.length).to.equal(1);
    const handler = ctx.plugin('handler', ctx.handlers[0]);
    expect(handler).to.be.ok;
    const fp = `/tmp/test/${handler.io.info.mainId}`;
    setImmediate(function () {
      expect(fs.existsSync(fp)).to.be.true;
      expect(fs.readFileSync(fp, 'utf8')).to.include('test');
      done();
    });
  });


});
