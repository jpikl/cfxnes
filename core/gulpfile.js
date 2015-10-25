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

gulp.task('test-base', function() {
  return gulp.src('./test/**/*Test.js')
    .pipe(mocha());
});

gulp.task('test-roms', function() {
  return gulp.src('./test/roms/tests.js')
    .pipe(mocha({timeout: 60000}));
});

gulp.task('test', gulp.series('test-base', 'test-roms'));

//=========================================================
// Default
//=========================================================

gulp.task('default', gulp.series('test'));
