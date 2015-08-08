var debug = require('..')('app:test1');

debug('foo bar');
debug('hello %s', 'world');


var debug2 = require('..')('app:test2');

debug2('baby');
