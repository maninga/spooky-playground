#!/usr/bin/env bash

echo "postinstall du projet"
echo " * installation de phantomjs et de casperjs globalement"
npm install -g casperjs phantomjs
echo " * installation des dépendances de spooky localement"
if [ -d ./node_modules/spooky ]; then
  pushd ./node_modules/spooky && npm i && popd
fi
echo "Done."
exit 0
