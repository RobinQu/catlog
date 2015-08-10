expect = require('chai').expect
sinon = require('sinon')

describe 'Simple formatter', ->

  SF = require('../lib/plugins/simple_formatter')

  it 'should create as a plugin', ->
    expect(SF.pluginName).to.equal('simple')
    expect(SF.pluginType).to.equal('formatter')
    plugin = SF.create()
    expect(plugin.fmt).to.be.ok

  it 'should return formatted content', ->
    sf = SF.create()
    event =
      target: 'stdout',
      category: 'test',
      raw: 'hello, world',
      datetime: new Date()
    res = sf.fmt('foobar', event)
    expect(res).to.be.ok
    expect(res).to.contain('FOOBAR')
    expect(res).to.contain(process.pid)
    expect(res).to.contain(event.datetime.toISOString())
    expect(res).to.contain('test')
    expect(res).to.contain('hello, world')

  it 'should configure themes', ->
    sf = SF.create()
    colors = require('colors/safe')
    sf.configure(
      theme:
        debug: 'red',
        info: 'red',
        warn: 'red',
        error: 'red',
        'default': 'green'
    )
    stub1 = sinon.stub(colors, 'debug')
    stub2 = sinon.stub(colors, 'default')
    stub1.returnsArg(0)
    stub2.returnsArg(0)
    event =
      target: 'stdout',
      category: 'test',
      raw: 'hello, world',
      datetime: new Date()
    sf.fmt('debug', event)
    expect(stub1.calledOnce).to.be.true
    sf.fmt('notfound', event)
    expect(stub2.calledOnce).to.be.true
    stub1.restore()
    stub2.restore()
