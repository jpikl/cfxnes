const gulp = require('gulp');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');

require('babel-core/register');

//=========================================================
// Linter
//=========================================================

gulp.task('lint', () => {
  return gulp.src(['./gulpfile.js', './{src,test}/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format());
});

//=========================================================
// Tests
//=========================================================

gulp.task('test', () => {
  return gulp.src('./test/**/*Test.js')
    .pipe(mocha({timeout: 10000}));
});

//=========================================================
// Default
//=========================================================

gulp.task('default', gulp.series('test'));
