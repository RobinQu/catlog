'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');


describe('Log method', function () {

  const ctx = require('../lib/context').one;
  const logMethod = require('../lib/log_method').bind(ctx);
  const raw = require('../lib/raw');

  it('should plant log method to target', function () {
    const target = {};
    logMethod('info', {category: 'sexy'}, target);
    expect(target.info).to.be.ok;
    expect(target.info.category).to.equal('sexy');
    expect(target.info.target).to.equal(target);
  });

  it('should get formatter according to params.formatter', function () {
    const formatter = sinon.spy(ctx, 'formatter');
    const target = {};
    const fmt = sinon.stub().returns('super');
    const Plugin = {
      pluginName: 'boy',
      pluginType: 'formatter',
      create: ()=> {
        return {fmt: fmt};
      }
    };
    ctx.register(Plugin);
    logMethod('cool', {formatter: 'boy'}, target);
    expect(target.cool).to.be.ok;
    target.cool('car');
    expect(formatter.callCount).to.equal(1);
    expect(formatter.firstCall.args[0]).to.equal('boy');
    expect(fmt.callCount).to.equal(1);
    const args = fmt.firstCall.args;
    expect(args[0]).to.equal('cool');
    expect(args[2][0]).to.equal('car');
    ctx.unregister(Plugin);
    formatter.restore();
  });

  it('should emit log event', function () {
    const target = {};
    const params = {
      level: 101,
      target: 'stdout'
    };
    const emit = sinon.spy(ctx, 'emit');
    logMethod('info', params, target);
    target.info('hello');
    expect(emit.calledOnce).to.be.true;
    const args = emit.firstCall.args;
    expect(args[0]).to.equal('log');
    expect(args[1]).to.be.ok;
    expect(args[1].datetime).to.be.an.instanceof(Date);
    expect(args[1].name).to.equal('info');
    expect(args[1].level).to.equal(params.level);
    expect(args[1].hostname).to.be.ok;
    expect(args[1].pid).to.be.ok;
    expect(args[1].raw).to.equal('hello');
    expect(args[1].target).to.equal('stdout');
    emit.restore();
  });

  it('should write to stdout or stderr by params.target', function () {
    const stdoutSpy = sinon.spy(raw, 'stdout');
    const stderrSpy = sinon.spy(raw, 'stderr');
    const target = {};
    logMethod('info', {target: 'stdout'}, target);
    logMethod('scream', {target: 'stderr'}, target);
    target.info('hello, world!');
    target.scream('help!');
    expect(stdoutSpy.callCount).to.equal(1);
    expect(stdoutSpy.firstCall.args[0]).to.contain('hello, world!');
    expect(stderrSpy.callCount).to.equal(1);
    expect(stderrSpy.firstCall.args[0]).to.contain('help!');
    stdoutSpy.restore();
    stderrSpy.restore();
  });
});
