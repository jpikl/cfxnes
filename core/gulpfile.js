const gulp = require('gulp');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const yargs = require('yargs');

require('babel-core/register');

//=========================================================
// Arguments
//=========================================================

const argv = yargs
  .alias('g', 'grep')
  .argv;

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

gulp.task('test-base', () => {
  return gulp.src('./test/**/*Test.js')
    .pipe(mocha({grep: argv.grep}));
});

gulp.task('test-roms', () => {
  return gulp.src('./test/roms/tests.js')
    .pipe(mocha({timeout: 60000, grep: argv.grep}));
});

gulp.task('test', gulp.series('test-base', 'test-roms'));

//=========================================================
// Default
//=========================================================

gulp.task('default', gulp.series('test'));
