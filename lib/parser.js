const util = require('util');
const Spooky = require('spooky');

class World {
  constructor ({ url, options, cb, debug, debugRpc, trackErrors }) {

    const onCreated = (error, response) => {
      if (error) {
        console.dir(error);
        throw new Error(`Failed to initialize context.spooky: ${error.code} - ${error.message}`);
      }
      cb(this);
    };

    options = options || {
        casper: {
          // waitTimeout: 25000,
          // userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux i686; rv:26.0) Gecko/20100101 Firefox/26.0',
          // clientScripts: [],
          // pageSettings: {
          //   webSecurityEnabled: false,
          //   loadPlugins: false
          // },
          verbose: true,
          logLevel: 'debug'
        },
        child: {
          // spooky_lib: './',
          // script: './lib/bootstrap.js',
          'ignore-ssl-errors': true,
          'web-security': 'no',
          // port: 8081,
          transport: 'http'
        }
    };

    try {
      this.url = url;
      this.spooky = new Spooky(options, onCreated);
    } catch (e) {
      console.dir(e);
      console.trace('Spooky.listen failed');
    }

    const spooky = this.spooky;

    if (debug) {
      spooky.debug = true;
    }

    if (debugRpc) {
      spooky.debugRpc = true;
    }

    // track errors
    if (trackErrors) {
      spooky.errors = [];
      spooky.on('error', function (error) {
          error = error.data ? error.data : error;
          spooky.errors.push(error);
          if (spooky.debug) {
              console.error('spooky error', util.inspect(error));
          }
      });
    }

    spooky.console = [];
    spooky.on('console', function (line) {
        spooky.console.push(line);
        if (spooky.debug) {
            console.log(line);
        }
    });

    spooky.on('log', function (entry) {
        if (!spooky.debugRpc) { return; }
        if (entry.space === 'remote' || entry.space === 'phantom') { return; }

        var message = entry.message;
        var event = (message.event || '').toLowerCase();

        if (event === 'request') {
            console.log('%s: [%s] %s %s',
                spooky.options.child.port, entry.space, message.method, message.request.url);
            console.log(' Headers: %s',
                util.inspect(message.request.headers));
            console.log(' Payload: %s',
                util.inspect(JSON.parse(message.request.post)));
        } else if (event === 'response') {
            console.log('%s: [%s] %s %s',
                spooky.options.child.port, entry.space, message.code,
                util.inspect(JSON.parse(message.body)));
        } else {
            console.log('%s: [%s]', spooky.options.child.port, entry.space);
            console.dir(entry);
        }
    });
  }
}

module.exports = World;
