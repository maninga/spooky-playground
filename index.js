'use strict';

const Parser = require('./lib/parser');

const parserMethod = (bot) => {
  const { spooky, url } = bot;

  spooky.start(url);

  spooky.then(function extractTitleAndSayHi() {
    /* this is executed on casper environment */
    const casper = this;
    /* evaluate enable serialization from browser env to casper env */
    const docTitle = casper.evaluate(function getDocumentTitle() {
      /* this is executed in browser env */
      return document.title;
    });

    // this is emitted from casper to spooky
    casper.emit('hello', 'Hello, from ' + docTitle);
  });

  spooky.then(function () {
    /* this is executed in casper context */
    const casper = this;
    casper.emit('parsing.done', this.results);
  });

  // permanent message handler
  spooky.on('hello', function (greeting) {
    /* this is executed in spooky context */
    /* const spooky = this; */
    console.log(greeting);

    // here you can continue processing
    spooky.then([
      // a variable called results will be defined in casper context
      // with it value set as a copy of greeting in spooky context
      { results: greeting },
      function setResults() {
        const casper = this;
        casper.results = results;
      }
    ]);

    // or you can store data in database, or create csv ...
  });

  // one time message handler
  spooky.once('parsing.done', function (results) {
    /* this is executed in spooky context */
    console.log('parsing.done emitted with results:', results);

    // here you can continue processing
    // or you can store data in database, or create csv ...
  });

  spooky.run();
};

new Parser({
  url: 'http://www.google.fr',
  debug: true,
  trackErrors: true,
  cb: parserMethod
});
