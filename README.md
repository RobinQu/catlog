# catlog

Modern log utility for node apps

* debug utility like [visionmedia/debug](https://github.com/visionmedia/debug)
* full feature logging utilites
* extensible logging frameworks
  * plugins like formatters and log handlers
  * event-driven logging activity
  * context-based configuration


## Usage

### Simple debug

Just like the popular [visionmedia/debug](https://github.com/visionmedia/debug).

```
var debug = require('catlog')('app:main');

debug('I am here');
debug('Hi, babe!');
```

But the log goes to other handlers ([fs_handler](lib/plugins/fs_handler.js) as default) as well. So your debug info will have chances to be recorded by `fs_handler` in files, instead of being deserted if no `DEBUG` env is set.

### Log, in levels

Behave like old-fashined log utilites.

```
var logger = require('catlog')();

logger.info('good news');
logger.warn('important notice');
logger.error('bad news');
logger.debug('verbose news');
//also have alias, as `log`
logger.log('bad news');
```

## Configuration

All settings are shared in the same process. And configure it on logging context, using:

```
var logger = require('catlog')({
  methods: {
    foobar: {
      target: 'stdout',
      level: 70
    }
  },
  category: 'special_app'
});
```


## License

MIT
