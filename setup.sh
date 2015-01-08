#!/bin/sh

# TODO specify version for each package

echo "Installing npm modules..."

npm install bower \
            chai \
            chai-fs \
            closure-compiler \
            coffee-script \
            express \
            event-stream \
            gulp \
            gulp-closure-compiler \
            gulp-coffee \
            gulp-concat \
            gulp-if \
            gulp-jade \
            gulp-mocha \
            gulp-nodemon \
            gulp-open \
            gulp-rimraf \
            gulp-stylus \
            gulp-util \
            js-md5 \
            morgan \
            screenfull \
            yargs

echo "Installing bower components..."

./node_modules/bower/bin/bower install angular \
                                       angular-bootstrap \
                                       angular-route \
                                       angular-ui-router \
                                       bootstrap \
                                       jquery \
                                       js-md5 \
                                       screenfull
