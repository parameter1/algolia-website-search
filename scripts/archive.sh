#!/bin/bash

rm -rf node_modules Archive.zip
yarn install --production --pure-lockfile
zip -r Archive.zip . -x .git/\*
