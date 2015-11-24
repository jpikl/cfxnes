var gulp = require('gulp');
var jscs = require('gulp-jscs');
var mocha = require('gulp-mocha');

require('babel-core/register');

//=========================================================
// Check code style
//=========================================================

gulp.task('lint', function() {
  return gulp.src(['./gulpfile.js', './{src,test}/**/*.js'])
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
