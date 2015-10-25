var gulp = require('gulp');
var jscs = require('gulp-jscs');
var mocha = require('gulp-mocha');

require('babel/register');

//=========================================================
// Validate code style
//=========================================================

gulp.task('validate', function() {
  return gulp.src('./{src,test}/**/*.js')
    .pipe(jscs())
    .pipe(jscs.reporter());
});

//=========================================================
// Tests
//=========================================================

gulp.task('test', function() {
  return gulp.src('./test/**/*Test.js')
    .pipe(mocha({timeout: 10000}));
});

//=========================================================
// Default
//=========================================================

gulp.task('default', gulp.series('test'));
