'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');

describe('Simple formatter', function () {

  const SF = require('../lib/plugins/simple_formatter');

  it('should create as a plugin', function () {
    expect(SF.pluginName).to.equal('simple');
    expect(SF.pluginType).to.equal('formatter');
    const plugin = SF.create();
    expect(plugin.fmt).to.be.ok;
  });

  it('should return formatted content', function () {
    const sf = SF.create();
    const event = {
      target: 'stdout',
      category: 'test',
      raw: 'hello, world',
      datetime: new Date()
    };
    const res = sf.fmt('foobar', event);
    expect(res).to.be.ok;
    expect(res).to.contain('FOOBAR');
    expect(res).to.contain(process.pid);
    expect(res).to.contain(event.datetime.toISOString());
    expect(res).to.contain('test');
    expect(res).to.contain('hello, world');
  });

  it('should configure themes', function () {
    const sf = SF.create();
    const colors = require('colors/safe');
    sf.configure({
      theme: {
        debug: 'red',
        info: 'red',
        warn: 'red',
        error: 'red',
        'default': 'green'
      }
    });
    const stub1 = sinon.stub(colors, 'debug');
    const stub2 = sinon.stub(colors, 'default');
    stub1.returnsArg(0);
    stub2.returnsArg(0);
    const event = {
      target: 'stdout',
      category: 'test',
      raw: 'hello, world',
      datetime: new Date()
    };
    sf.fmt('debug', event);
    expect(stub1.calledOnce).to.be.true;
    sf.fmt('notfound', event);
    expect(stub2.calledOnce).to.be.true;
    stub1.restore();
    stub2.restore();
  });

});
