'use strict';

const Context = require('../').Context;
const fs = require('fs');
const expect = require('chai').expect;

describe('Context', function () {

  it('should create with options', function () {
    const ctx = new Context({
      plugins: [
        {type: 'handler', name: 'fs', dir: '/tmp/logs'}
      ]
    });
    const logger = ctx.logger();
    logger.info('test');
    expect(fs.existsSync('/tmp/logs')).to.be.true;
    expect(ctx.handlers.length).to.equal(1);
    const handler = ctx.plugin('handler', ctx.handlers[0]);
    expect(handler).to.be.ok;
    var fp = `/tmp/logs/${handler.fileIds.info}`;
    expect(fs.existsSync(fp)).to.be.true;
    expect(fs.readFileSync(fp)).to.include('test');
  });


});
