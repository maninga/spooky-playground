'use strict';

const Parser = require('./lib/parser');
const parserMethod = (bot) => {
  const { spooky, url } = bot;


  spooky.start(url);


  spooky.then(function fillSearchForm() {
    const casper = this;
    casper.fill('form[action="/search"]', {
      q: "casperjs"
    }, true);
  });

  spooky.waitFor(function checkResultsPresence() {
    const casper = this;
    return casper.fetchText('div.g').length > 0;
  }, function countSearchResults() {
    const casper = this;
    const resultsCount = casper.evaluate(function countResults(){
      return document.querySelectorAll('div.g').length;
    });
    casper.emit('results.counted', resultsCount);
  });

  // permanent message handler
  spooky.on('results.counted', function (count) {
    /* this is executed in spooky context */
    /* const spooky = this; */
    console.log(`There is ${count} results`);
  });

  spooky.run();
};

new Parser({
  url: 'https://www.google.fr',
  debug: true,
  trackErrors: true,
  cb: parserMethod
});
