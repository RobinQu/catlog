logMethod = require('../lib/log_method')
expect = require('chai').expect
sinon = require 'sinon'


describe 'Log method', ->

  ctx = require('../lib/context')
  raw = require('../lib/raw')

  it 'should plant log method to target', ->
    target = {}
    logMethod('info', {category: 'sexy'}, target)
    expect(target.info).to.be.ok
    expect(target.info.category).to.equal('sexy')
    expect(target.info.target).to.equal(target)

  it 'should get formatter according to params.formatter', ->
    formatter = sinon.spy(ctx, 'formatter')
    target = {}
    fmt = sinon.stub().returns('super')
    Plugin =
      pluginName: 'boy',
      pluginType: 'formatter',
      create: ->
        fmt: fmt

    ctx.register(Plugin)
    logMethod('cool', formatter: 'boy', target)
    expect(target.cool).to.be.ok
    target.cool('car')
    expect(formatter.callCount).to.equal(1)
    expect(formatter.firstCall.args[0]).to.equal('boy')
    expect(fmt.callCount).to.equal(1)
    args = fmt.firstCall.args
    expect(args[0]).to.equal('cool')
    expect(args[2][0]).to.equal('car')
    ctx.unregister(Plugin)
    formatter.restore()

  it 'should emit log event', ->
    target = {}
    params = {
      level: 101,
      target: 'stdout'
    }
    emit = sinon.spy(ctx, 'emit')
    logMethod('info', params, target)
    target.info('hello')
    expect(emit.calledOnce).to.be.true
    args = emit.firstCall.args
    expect(args[0]).to.equal('log')
    expect(args[1]).to.be.ok
    expect(args[1].datetime).to.be.an.instanceof(Date)
    expect(args[1].name).to.equal('info')
    expect(args[1].level).to.equal(params.level)
    expect(args[1].hostname).to.be.ok
    expect(args[1].pid).to.be.ok
    expect(args[1].raw).to.be.ok
    expect(args[1].raw[0]).to.equal('hello')
    expect(args[1].formatted).to.be.ok
    emit.restore()

  it 'should write to stdout or stderr by params.target', ->
    stdoutSpy = sinon.spy(raw, 'stdout')
    stderrSpy = sinon.spy(raw, 'stderr')
    target = {}
    logMethod('info', target: 'stdout', target)
    logMethod('scream', target: 'stderr', target)
    target.info('hello, world!')
    target.scream('help!')
    expect(stdoutSpy.callCount).to.equal(1)
    expect(stdoutSpy.firstCall.args[0]).to.contain('hello, world!')
    expect(stderrSpy.callCount).to.equal(1)
    expect(stderrSpy.firstCall.args[0]).to.contain('help!')
    stdoutSpy.restore()
    stderrSpy.restore()
