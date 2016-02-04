# Setting Up a Development Environment

1) Install [make](https://en.wikipedia.org/wiki/Make_(software)), 
           [nodejs](https://nodejs.org) and 
           [npm](https://www.npmjs.com).

2) Install [gulp-cli](https://www.npmjs.com/package/gulp-cli) (v4) and optionally 
           [npm-check-updates](https://www.npmjs.com/package/npm-check-updates):

    npm install -g gulpjs/gulp-cli#4.0
    npm install -g npm-check-updates

3) Install project dependencies:

    make install_deps

## Useful Make Targets

Build library (minified and debug version) and application:

    make all

Build library in debug mode + watch changes:

    make dev_lib

Build application in debug mode + watch changes + run browser sync:

    make dev_app

Run all tests:

    make test
