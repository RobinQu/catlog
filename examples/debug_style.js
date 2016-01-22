'use strict';

const debug = require('..')('app:test1');

debug('foo bar');
debug('hello %s', 'world');


const debug2 = require('..')('app:test2');

debug2('baby');

debug2(new Error('boom'));
